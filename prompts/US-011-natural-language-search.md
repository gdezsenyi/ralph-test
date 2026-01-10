# US-011: Natural Language Knowledge Queries

## Task

Implement natural language query interface for the decision archive. Allow executives to ask questions in plain English about past decisions ('What did we decide about the Q3 budget?') and receive relevant results. Handle ambiguous queries with clarifying questions. Suggest alternative search terms when no results found.

## Context

Keyword search requires users to know exact terms used. Natural language search lets executives ask questions as they would to a human assistant. This significantly improves decision retrieval speed and reduces friction. Semantic search understands intent beyond exact keyword matching.

## Requirements

- [ ] Accept natural language questions and return relevant decisions
- [ ] Handle specific decision queries (e.g., 'What did we decide about the Q3 budget?')
- [ ] Ask clarifying questions for ambiguous queries
- [ ] Suggest alternative search terms when no results found
- [ ] Support follow-up questions with maintained conversation context

## Technical Specifications

- Implement semantic search using Azure Cognitive Search or embeddings
- Use vector similarity for intent matching beyond keywords
- Consider chat-like interface for iterative queries
- Log queries for continuous improvement of search relevance
- Clarification logic: detect multiple possible intents -> present options
- Alternative suggestions: use related terms, broader/narrower concepts
- Maintain session context for follow-up questions

## Files to Create/Modify

- `src/api/routes/natural_language_search_routes.py`
- `src/api/routes/test_natural_language_search_routes.py`
- `src/services/search/semantic_search_service.py`
- `src/services/search/test_semantic_search_service.py`
- `src/services/search/query_understanding.py`
- `src/services/search/test_query_understanding.py`
- `src/integrations/cognitive/embeddings_client.py`
- `src/models/semantic_search.py`
- `src/schemas/semantic_search_schemas.py`

## Success Criteria

When complete:
- Natural language query API endpoint implemented
- Semantic search returns relevant results beyond keyword matching
- Clarifying questions presented for ambiguous queries
- Alternative suggestions shown when no results found
- Follow-up questions maintain conversation context
- Query logging implemented for improvement
- Search response time <3 seconds
- All unit tests pass with >80% coverage

## Verification

Run these commands to verify completion:
```bash
pytest src/services/search/test_semantic_search_service.py -v
pytest src/services/search/test_query_understanding.py -v
pytest src/api/routes/test_natural_language_search_routes.py -v
ruff check src/
mypy src/
```

## Completion

Output `<promise>US_011_NATURAL_LANGUAGE_SEARCH_COMPLETE</promise>` when ALL of the following are true:
- All requirements checked off
- All tests pass with >80% coverage
- All files created/modified as specified
- Verification commands pass

## Dependencies

- US-007 (Decision Archive and Search)

## If Stuck

- If semantic search accuracy is too low, fall back to enhanced keyword search
- If embedding generation is too slow, implement caching and batch processing
- If clarification logic is too complex, simplify to single most-likely interpretation
- After 40 iterations, prioritize core NL search over conversation features

## Self-Correction

- Test with diverse question phrasings for same intent
- Verify semantic similarity correctly identifies related concepts
- Check clarification prompts are helpful and not annoying
- Monitor search accuracy and log queries that return poor results
- Test follow-up questions with various conversation flows
