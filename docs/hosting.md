# MathQuest — Hosting Options

## Comparison

| Component | Option 1: Low-Ops SaaS | Option 2: AWS-Centric |
|---|---|---|
| Frontend Hosting | Vercel Pro | AWS Amplify |
| Backend/API | Vercel Functions / Supabase Edge Functions | AWS Lambda |
| Database | Supabase (Postgres) | DynamoDB or Amazon RDS (Postgres) |
| Authentication | Supabase Auth | Amazon Cognito |
| File Storage | Supabase Storage | Amazon S3 |
| Payments | Stripe | Stripe |
| AI/LLM | OpenAI / Gemini / Claude (any provider) | Amazon Bedrock or external APIs (OpenAI, Gemini, Claude) |
| SSL & CDN | Included | Included (CloudFront) |
| Monitoring | Vercel + Supabase dashboards | CloudWatch |
| Monthly Platform Cost (small app) | ~$45–$100/month | ~$20–$100/month (usage dependent) |
| LLM Cost | Usage-based (typically $0.20–$2 per active student/month, depending on model and prompts) | Same |
| Operations | Very low | Moderate |
| Scalability | Excellent | Excellent |
| Best For | Startups, MVPs, small teams | Teams already experienced with AWS or expecting complex infrastructure |

## Cost example (1,000 active students)

| Cost Item | Estimate |
|---|---|
| Hosting & Infrastructure | $50–$100/month |
| LLM Usage | ~$200–$1,500/month (depends heavily on model and usage) |
| Stripe Fees | ~2.9% + $0.30 per transaction |
| **Total (excluding Stripe)** | **~$250–$1,600/month** |

## Recommendation

| If… | Choose |
|---|---|
| You want the fastest, simplest launch | Vercel + Supabase |
| Your team already has AWS expertise or expects enterprise-scale infrastructure | AWS (Amplify + Lambda + Cognito + DynamoDB/RDS) |

For a new educational app like MathQuest, I'd generally recommend **Option 1**. It requires much
less infrastructure work, so you can spend more time improving the learning experience rather
than managing servers.
