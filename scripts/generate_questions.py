#!/usr/bin/env python3
import requests
import json
import os
import time
from typing import List, Dict

FORGE_API_URL = os.getenv("BUILT_IN_FORGE_API_URL", "https://api.manus.im")
FORGE_API_KEY = os.getenv("BUILT_IN_FORGE_API_KEY", "")

SAA_TOPICS = [
    "EC2",
    "S3",
    "VPC",
    "RDS",
    "DynamoDB",
    "Lambda",
    "CloudFront",
    "Route53",
    "ELB",
    "Auto Scaling",
    "IAM",
    "CloudWatch",
    "SNS",
    "SQS",
    "Kinesis",
    "ElastiCache",
    "Redshift",
    "EMR",
    "CloudFormation",
    "OpsWorks",
]

CLF_TOPICS = [
    "AWS Global Infrastructure",
    "AWS Services Overview",
    "Compute Services",
    "Storage Services",
    "Database Services",
    "Networking Services",
    "Security & Compliance",
    "Pricing & Support",
    "AWS Well-Architected Framework",
    "Sustainability",
]


def invoke_llm(messages: List[Dict], response_format: Dict = None) -> Dict:
    """Call the Forge LLM API"""
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {FORGE_API_KEY}",
    }

    payload = {
        "model": "gpt-4o-mini",
        "messages": messages,
        "temperature": 0.7,
    }

    if response_format:
        payload["response_format"] = response_format

    response = requests.post(
        f"{FORGE_API_URL}/v1/chat/completions",
        headers=headers,
        json=payload,
        timeout=60,
    )

    if response.status_code != 200:
        raise Exception(f"LLM API error: {response.status_code} {response.text}")

    return response.json()


def generate_questions_for_topic(
    certification: str, topic: str, count: int
) -> List[Dict]:
    """Generate questions for a specific topic"""
    prompt = f"""You are an AWS certification exam expert. Generate {count} realistic, high-quality {certification} exam questions about "{topic}".

For each question, provide:
1. A realistic scenario-based question (2-3 sentences)
2. Four multiple-choice options (A, B, C, D)
3. The correct answer (single letter: A, B, C, or D)
4. A detailed explanation (2-3 sentences) explaining why the correct answer is right and why others are wrong

Format your response as a JSON array with this structure:
[
  {{
    "question": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "A",
    "explanation": "Explanation here",
    "topic": "{topic}",
    "certification": "{certification}",
    "difficulty": "medium"
  }}
]

Make questions realistic, varied, and aligned with the actual {certification} exam. Include scenario-based questions that test practical AWS knowledge. Ensure all questions are unique and cover different aspects of {topic}."""

    try:
        response = invoke_llm(
            [
                {
                    "role": "system",
                    "content": "You are an AWS certification expert. Generate realistic exam questions in valid JSON format. Return ONLY the JSON array, no other text.",
                },
                {"role": "user", "content": prompt},
            ]
        )

        content = response["choices"][0]["message"]["content"]
        
        # Try to parse as JSON
        try:
            parsed = json.loads(content)
        except json.JSONDecodeError:
            # If parsing fails, try to extract JSON from the content
            import re
            json_match = re.search(r'\[.*\]', content, re.DOTALL)
            if json_match:
                parsed = json.loads(json_match.group())
            else:
                print(f"Failed to parse JSON for {certification} - {topic}")
                return []

        questions = parsed if isinstance(parsed, list) else parsed.get("questions", [])

        # Normalize correctAnswer to index (0-3)
        for q in questions:
            if isinstance(q.get("correctAnswer"), str):
                q["correctAnswer"] = ord(q["correctAnswer"].upper()) - ord("A")

        return questions

    except Exception as error:
        print(f"Error generating questions for {certification} - {topic}: {error}")
        return []


def generate_all_questions():
    """Generate all AWS exam questions"""
    print("🚀 Starting AWS exam question generation...\n")

    all_questions = []

    # Generate SAA-C03 questions (20 topics × 25 questions = 500)
    print("📚 Generating AWS SAA-C03 questions (500 total)...")
    for i, topic in enumerate(SAA_TOPICS, 1):
        print(f"  [{i}/{len(SAA_TOPICS)}] Generating {topic} questions...")
        questions = generate_questions_for_topic("SAA-C03", topic, 25)
        all_questions.extend(questions)
        print(f"  ✓ Generated {len(questions)} questions for {topic}")
        time.sleep(2)  # Rate limiting

    # Generate CLF-C02 questions (10 topics × 50 questions = 500)
    print("\n📚 Generating AWS CLF-C02 questions (500 total)...")
    for i, topic in enumerate(CLF_TOPICS, 1):
        print(f"  [{i}/{len(CLF_TOPICS)}] Generating {topic} questions...")
        questions = generate_questions_for_topic("CLF-C02", topic, 50)
        all_questions.extend(questions)
        print(f"  ✓ Generated {len(questions)} questions for {topic}")
        time.sleep(2)  # Rate limiting

    print(f"\n✅ Total questions generated: {len(all_questions)}")

    # Save to file
    output_path = os.path.join(os.getcwd(), "generated-questions.json")
    with open(output_path, "w") as f:
        json.dump(all_questions, f, indent=2)
    print(f"📁 Questions saved to: {output_path}")

    return all_questions


if __name__ == "__main__":
    generate_all_questions()
