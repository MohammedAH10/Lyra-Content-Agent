AI
ENGINEERING
&
DEVELOPMENT ASSESSMENT
AGENT
T-World – AI-Powered Files, Docs & Smart Posting System
1. OBJECTIVE
Evaluate the candidate’s ability to:
●​ Build and integrate AI-powered product features
●​ Design LLM workflows, including prompting, retrieval, orchestration, model routing,
and fallback behaviour
●​ Implement backend + AI + retrieval + database + UI-consumption flows
●​ Demonstrate awareness of open-source LLMs, API-based LLMs, and when each may be
appropriate
●​ Consider AWS/cloud and compute infrastructure implications for AI workflows
●​ Handle real-world system concerns including latency, failure, state, logging, permissions,
cost, and UX alignment
●​ Incorporate AI-related code into a maintainable product codebase using clean structure
and GitHub-ready handover practices
●​ Translate product requirements into working AI-enabled systems that can move toward
production, not just functional demos
2. CONTEXT
You are working on T-World, where:
●​ A Files & Docs module already exists (design and instructions will be provided )
●​ Files are uploaded and moderated via AWS workflows
●​ Users can attach media when creating posts
Requirement:
Derive a post creation experience using AI
Instead of users writing everything manually:●​ AI should assist in writing posts
●​ AI should recommend relevant content/media
●​ AI should leverage user files and context
●​ T-World’s long-term AI direction is to build a governed proprietary AI layer that
combines approved models, internal KB logic, user-context logic, permissions, retrieval
systems, and model-routing decisions. The candidate is not expected to train a foundation
model from scratch, but should show awareness of how open-source models, API-based
LLMs, orchestration tools, retrieval layers, and cloud infrastructure can be combined into
a controlled AI product workflow
3. CORE TASK
Design and implement an AI-assisted post creation system integrated with:
●​ Files & Docs module
●​ AI workflows (LLM-based)
●​ Backend APIs
●​ Retrieval and recommendation logic
●​ MongoDB metadata/logging/storage logic
●​ Basic AWS/S3 reference logic
●​ GitHub-ready code structure and documentation
The solution may be simplified, but it must show how the feature would work in a real product
environment and how another engineer could review, test, and continue the work.
4. FUNCTIONAL REQUIREMENTS
A. AI Writing Assistant
When a user is creating a post:The system should:
1.​ Accept user input (topic, prompt, or partial text)
2.​ Generate:
o​ Suggested post content
o​ Improved/rephrased versions
o​ Structured outputs (short, long, bullet, etc.)
3.​ Allow:
o​ Edit
o​ Regenerate
o​ Accept output
Focus:
●​ Prompt design
●​ Output quality
●​ UX integration logic
B. Smart Media Recommendations
When users attach media:
The AI should:
●​ Suggest relevant files from Files & Docs module
●​ Use:
o​ File metadata
o​ File type
o​ Context of the post
Example:
●​ If user writes about “education” → suggest PDFs, images related to learning
Focus:
●​ Retrieval logic
●​ Ranking relevance
●​ Context-aware suggestions
C. Asset Picker IntegrationReplace local upload dependency with:
●​ Files & Docs-based asset picker
●​ AI-assisted suggestions inside picker
Flow:​
User clicks “Attach” →​
Opens asset picker →​
AI suggests relevant assets →​
User selects → attaches
D. AI Recommendation Layer
The system should also:
●​ Suggest:
o​ Hashtags
o​ Post improvements
o​ Related content ideas
5. TECHNICAL REQUIREMENTS
Must Use:
●​ Node.js with Express
●​ MongoDB for file metadata, context, logs, or workflow records
●​ API-based LLM integration using OpenAI or an approved equivalent
●​ Basic retrieval logic using file metadata, post context, tags, file type, approval status, and
relevance ranking
●​ Basic AWS/S3 awareness, including how uploaded files would be referenced rather than
locally re-uploaded
●​ Clean code structure suitable for GitHub review and handover
AI Layer:
Implement at least one of:
●​ Prompt orchestration
●​ Context injection using user context and file metadata
●​ Retrieval-based media/file suggestions
●​ Model routing or fallback logic●​ Basic comparison of whether a closed-model API or open-source/lightweight model
would be appropriate for the task
●​ Cost-aware logic, such as when to use a basic/free workflow versus when a premium
model may be justified
●​ Structured AI output parsing and validation
The candidate does not need to deploy a live open-source model, but should explain how an
open-source or lightweight model could be considered, tested, or substituted in the workflow.
What Not to Do:
●​ · Do not build only a ChatGPT wrapper with no retrieval, permissions, or product logic.
●​ · Do not recommend rejected, unapproved, private, or inaccessible files.
●​ · Do not place all logic inside one route handler without separation.
●​ · Do not ignore weak input, no-result scenarios, AI failure, timeout, or malformed output.
●​ · Do not assume all AI tasks require the most expensive or most powerful model.
●​ · Do not submit a disconnected prototype that cannot be reviewed, tested, or integrated
into the wider platform codebase.
6. EXPECTED SYSTEM DESIGN
Candidate should demonstrate the following flow:
UI → API → AI Orchestration / Model Layer → Retrieval Layer → MongoDB / File
Metadata → Response → Frontend Consumption
Include:
●​ Input handling
●​ Prompt construction
●​ Context injection
●​ Retrieval and ranking logic
●​ Model/API call logic
●​ Output parsing and validation
●​ Error and fallback handling
●​ Permission and moderation-state checks
●​ Basic logging / traceability
●​ Explanation of where AWS/S3 file references fit into the flow
●​ Explanation of where open-source models, API-based models, or premium models could
fit into the flow7. DELIVERABLES
1. Code Implementation (Required)
The candidate must submit a working or clearly runnable codebase showing:
● API endpoints for AI post generation and media recommendation
● Backend logic for retrieval, recommendation, permissions, and moderation-state checks
● MongoDB usage for file metadata, context, logs, workflow records, or similar
● Basic AI integration logic using an API-based LLM or approved equivalent
● Clean separation between routes/controllers, AI logic, retrieval logic, database logic,
validation, and error handling
2. System Design Explanation (Required)
Short document or video explaining:
●​ Architecture
●​ AI workflow
●​ Prompt strategy
●​ Retrieval and ranking approach
●​ Model choice and routing logic
●​ Whether an open-source/lightweight model, API-based LLM, or premium model would
be appropriate and why
●​ AWS/S3 and compute-related assumptions
●​ How the code is structured for GitHub review and handover
3. Sample Outputs (Required)
The candidate must provide:
● Example prompts and generated post outputs
● Example media recommendation outputs
● Example handling of weak input, no-result retrieval, or AI failure
4. Model and Cost Reflection (Required)The candidate must include a short note explaining:
· Which model or LLM API they used or assumed
· Whether a smaller/open-source model could perform any part of the workflow
· Which parts of the workflow should remain low-cost/basic
· Which parts, if any, may justify premium model usage
· What data privacy, licensing, latency, or cost concerns they considered
5. Production Readiness Reflection Note (Required)
The candidate must submit a short written note answering the following:
1.​ What do you believe is the most fragile part of your solution if this were deployed into a
live product?
2.​ What would you monitor first after launch?
3.​ What would you improve first before calling the feature production-ready?
4.​ What assumptions did you make that would need to be validated with the product,
frontend, or backend team?
5.​ If another engineer had to take over your work next week, what would they need to
understand first?
6.​ Which part of your solution would be most expensive or compute-intensive if usage
scaled?
7.​ How would you decide whether to use a closed-model API, an open-source model, or a
smaller lightweight model for this workflow?
8.​ Where would model routing, fallback, or premium-use logic sit in your architecture?
9.​ What would need to be changed before this could be safely merged into an existing
GitHub codebase?
This note is required because the assessment is intended to test production-minded engineering
judgment, not only implementation ability.
6. Cross-Cutting Bonus
Stronger submissions may also include:
●​ Simple UI mock or integration demo
●​ Use of orchestration tools such as Flowise, LangChain, LangGraph, LlamaIndex, Dify, or
similar
●​ Embeddings, vector retrieval, semantic search, or more advanced ranking logic8.
ADDITIONAL
REQUIREMENTS
PRODUCTION-READINESS
The assessment is not only evaluating whether the candidate can produce a working demo. It is
also evaluating whether the candidate can design and implement the solution in a way that is
maintainable, reviewable, resilient, and suitable for use in a real product environment.
The candidate must therefore demonstrate the following in their submission:
A. Code Structure and Maintainability
The solution must show clear technical separation between:
●​ API routes / handlers
●​ AI orchestration or AI service logic
●​ retrieval / recommendation logic
●​ database access / persistence logic
●​ validation and error handling
●​ shared types / helper utilities where applicable
The solution should not place all business logic in a single file or route handler. Clean structure,
naming, and readability matter.
B. Reliability and Failure Handling
The solution must not assume ideal conditions only. It should show practical handling of:
●​ empty or weak user input
●​ no relevant files found
●​ AI timeout or provider failure
●​ malformed or unexpected AI output
●​ rejected or unapproved files accidentally appearing in results
●​ slow responses
●​ partial failure where one subsystem works and another fails
The candidate should show what the system returns in these cases and how the frontend or
consuming layer would handle them.
C. Permissions and Content Safety Awareness
The candidate must ensure that:
●​ only approved files can be recommended or attached
●​ rejected files must never appear in recommendation or asset-picking flows●​ file status and moderation state are respected consistently
●​ AI outputs do not bypass existing backend, moderation, or content-visibility rules
D. Logging and Traceability
The solution must include basic traceability and operational awareness. At minimum, it should
show how the system would log or record:
●​ AI generation requests
●​ recommendation requests
●​ fallback events
●​ errors or timeouts
●​ selected files or accepted outputs where relevant
This does not need to be enterprise-grade observability, but the submission must show awareness
that live AI features need reviewability and debugging support.
E. Model Choice, Cost, and Compute Awareness
The candidate must show awareness that AI features have model, cost, latency, infrastructure, and privacy
implications. The submission should explain:
●​
●​
●​
●​
●​
●​
· what model/API was used or assumed
· whether any part of the workflow could use an open-source or lightweight model
· where a premium model may be justified
· how fallback to a cheaper or simpler workflow could work
· what compute, AWS/cloud, storage, or latency assumptions are relevant
· how the design avoids unnecessary dependency on major closed-model providers where a
simpler approved model would be sufficient
F. Handover and Review Readiness
The candidate must write the solution as if another engineer may need to continue it later. The
submission should therefore be understandable by another developer and include:
●​ clear setup steps
●​ architecture summary
●​ explanation of core implementation decisions
●​ explanation of key assumptions
●​ explanation of known limitations
●​ explanation of what should be improved next if the feature were to move toward
productionG. Product-Environment Thinking
The submission should reflect real product thinking, not only technical implementation. The
candidate should demonstrate awareness of:
●​ user experience when AI is slow or uncertain
●​ the need for fallback behaviour
●​ relevance and ranking quality
●​ what should happen when no recommendation is strong enough
●​ how to avoid confusing or low-trust AI behaviour in a live app
9. ASSESSMENT SCORING RUBRIC
The submission will be evaluated across the following dimensions:
1. Architecture Quality
Assesses whether the candidate has structured the solution cleanly and sensibly across:
●​
●​
●​
●​
●​
API layer
AI workflow layer
retrieval/recommendation layer
data/storage layer
integration boundaries
Strong submissions will show modularity, separation of concerns, and implementation discipline.
2. AI Workflow Quality
Assesses the quality of:
●​
●​
●​
●​
●​
●​
prompt design
prompt orchestration
context injection
output shaping
regenerate/edit/accept flow handling
handling of weak or insufficient context
Strong submissions will show that AI behaviour has been intentionally designed rather than treated as a
raw API call.
3. Retrieval and Recommendation Quality
Assesses whether the media recommendation logic is:●​
●​
●​
●​
●​
relevant
context-aware
safe
explainable at a basic level
limited to approved/retrievable assets only
Strong submissions will show sensible ranking logic and good handling of low-match scenarios.
4. Reliability and Failure Handling
Assesses how well the submission handles:
●​
●​
●​
●​
●​
●​
●​
●​
AI failure
empty input
timeout
slow response
no-result cases
rejected file exclusion
malformed responses
partial subsystem failure
Strong submissions will show practical fallback logic and operational awareness.
5. Code Readability and Maintainability
Assesses:
●​
●​
●​
●​
●​
●​
code clarity
naming
organization
ease of continuation by another engineer
avoidance of unnecessary complexity
documentation discipline
Strong submissions will be readable, traceable, and maintainable.
6. Documentation and Handover Quality
Assesses:
●​
●​
●​
●​
●​
architecture explanation
setup instructions
implementation explanation
assumptions
known limitations●​ next-step thinking
Strong submissions will be easy for a reviewer or successor engineer to understand.
7. Product and UX Awareness
Assesses whether the candidate has thought beyond code and considered:
●​
●​
●​
●​
real user flows
loading/failure states
trust and clarity of AI behaviour
practical integration into a live product environment
Strong submissions will show product judgment, not only coding ability.
8. Model Strategy, Cost, and Compute Awareness
Assesses whether the candidate demonstrates practical awareness of:
· open-source versus closed-model options
· model routing and fallback logic
· cost-conscious AI implementation
· when premium model usage may be justified
· AWS/cloud and compute implications
· privacy, licensing, and deployment constraints
· how the solution could contribute to a proprietary T-World AI layer over time
Strong submissions will show that the candidate is not only calling an LLM API, but thinking about
model choice, cost, infrastructure, maintainability, and strategic control.
9. Alignment to Tongston’s Approved Stack and Delivery Model
Assesses how well the submission aligns with the required stack and operating model, including:
●​
●​
●​
●​
●​
●​
●​
●​
Node.js / Express
MongoDB
API-based LLM integration
open-source or lightweight LLM awareness
AWS/S3 and cloud/compute awareness where relevant
GitHub-ready code structure and handover discipline
practical integration with frontend consumption
maintainable handover and cross-functional reviewability
Strong submissions will align with the actual delivery environment rather than an abstract or unrelated
stack.
