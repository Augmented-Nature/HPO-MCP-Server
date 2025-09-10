# HPO MCP Server

An MCP (Model Context Protocol) server that provides access to the Human Phenotype Ontology (HPO) API. The HPO contains over 18,000 terms describing human phenotypic abnormalities and is widely used in genetic research and clinical diagnostics.

## Features

This MCP server provides 12 comprehensive tools to interact with the HPO API:

### Core Search & Information Tools
- **search_hpo_terms** - Search for HPO terms by keyword, ID, or synonym with pagination support
- **get_hpo_term** - Get detailed information about a specific HPO term by its ID
- **get_all_hpo_terms** - List all HPO terms with pagination
- **batch_get_hpo_terms** - Retrieve multiple HPO terms in a single request (up to 20 terms)

### Hierarchical Navigation Tools
- **get_hpo_ancestors** - Get all ancestor terms (all terms higher in the hierarchy)
- **get_hpo_parents** - Get direct parent terms (one level up)
- **get_hpo_children** - Get direct child terms (one level down)  
- **get_hpo_descendants** - Get all descendant terms (all terms lower in the hierarchy)

### Analysis & Utility Tools
- **validate_hpo_id** - Validate HPO ID format and verify term exists
- **get_hpo_term_path** - Get the full hierarchical path from root to a specific term
- **compare_hpo_terms** - Compare two terms and find their relationship and common ancestors
- **get_hpo_term_stats** - Get comprehensive statistics and analysis for an HPO term

## Prerequisites

- **Node.js**: Version 18 or higher
- **Internet connection**: Required for accessing the HPO API

## Installation

1. Clone or download this server:
```bash
cd hpo-server
npm install
```

2. Build the server:
```bash
npm run build
```

## Usage

### Running the Server

```bash
npm start
# or
node build/index.js
```

### Configuration

Add the server to your MCP settings file:

```json
{
  "mcpServers": {
    "hpo-server": {
      "command": "node",
      "args": ["/path/to/hpo-server/build/index.js"]
    }
  }
}
```

## Usage Examples

### Search and Discovery
1. **Search for seizure-related terms**:
   ```
   Search for HPO terms related to "seizure" using search_hpo_terms
   ```

2. **Search with pagination**:
   ```
   Search for "heart defect" terms with 20 results per page using search_hpo_terms
   ```

3. **Get detailed term information**:
   ```
   Get detailed information about seizure (HP:0001250) using get_hpo_term
   ```

### Hierarchical Navigation
4. **Explore term hierarchy**:
   ```
   Get all ancestors of seizure term using get_hpo_ancestors
   ```

5. **Find related terms**:
   ```
   Get direct children of nervous system abnormality using get_hpo_children
   ```

6. **Browse term descendants**:
   ```
   Get all descendant terms of seizure using get_hpo_descendants
   ```

### Analysis and Utilities
7. **Validate HPO IDs**:
   ```
   Validate if "HP:0001250" is a correct HPO ID using validate_hpo_id
   ```

8. **Get hierarchical path**:
   ```
   Show the complete path from root to seizure term using get_hpo_term_path
   ```

9. **Compare two terms**:
   ```
   Compare seizure and nervous system abnormality terms using compare_hpo_terms
   ```

10. **Get term statistics**:
    ```
    Get comprehensive statistics for seizure term using get_hpo_term_stats
    ```

11. **Batch processing**:
    ```
    Get information for multiple terms (HP:0001250, HP:0000707, HP:0001626) using batch_get_hpo_terms
    ```

12. **List all terms**:
    ```
    Browse all HPO terms with pagination using get_all_hpo_terms
    ```

## API Features

### HPO ID Format Support
HPO IDs can be provided in multiple formats:
- Full format: `HP:0001250`
- Short format: `0001250`
- The server automatically handles format conversion

### Pagination Support
Search and listing tools support pagination:
- `max` - Maximum results per page (varies by tool)
- `offset` - Number of results to skip (default: 0)

### Parameter Details
- **id** (string, required for most tools): HPO term ID
- **query** (string, required for search): Search query - keyword, HPO ID, or synonym
- **category** (array, optional): Filter by specific HPO categories
- **max** (number, optional): Maximum results to return
- **offset** (number, optional): Pagination offset

## API Details

- **Base URL**: https://ontology.jax.org/api/hp/
- **Authentication**: None required (public API)
- **Rate Limiting**: Managed by client with 30-second timeout
- **Error Handling**: Comprehensive error messages and graceful degradation

## Project Structure

```
hpo-server/
├── src/
│   ├── index.ts              # Main MCP server implementation
│   ├── types/
│   │   └── hpo.ts           # TypeScript interfaces for HPO data
│   ├── utils/
│   │   └── api-client.ts    # HPO API HTTP client
│   └── handlers/
│       └── hpo-handlers.ts  # MCP tool implementations
├── build/                   # Compiled JavaScript output
├── package.json
├── tsconfig.json
└── README.md
```

## Development

### Building the Server
```bash
cd hpo-server
npm run build
```

### Dependencies
- `@modelcontextprotocol/sdk` - MCP SDK for server implementation
- `axios` - HTTP client for HPO API requests

## About the Human Phenotype Ontology

The HPO provides a standardized vocabulary of phenotypic abnormalities encountered in human disease. Each term describes a phenotypic abnormality, such as "Atrial septal defect" or "Intellectual disability". The HPO is:

- A flagship product of the [Monarch Initiative](https://monarchinitiative.org/)
- Part of the [Global Alliance for Genomics and Health](https://www.ga4gh.org/) (GA4GH)
- Actively developed using medical literature, Orphanet, DECIPHER, and OMIM
- Used for phenotype-driven differential diagnostics and genomic analysis

## Error Handling

The server includes comprehensive error handling:
- Invalid HPO IDs are properly formatted when possible
- Network errors provide clear user-friendly messages  
- API errors are passed through with context
- Parameter validation with helpful error messages

## Limitations

- Maximum result limits are enforced to prevent overwhelming responses
- Network timeouts are set to 30 seconds for stability
- Some HPO API endpoints may have their own rate limiting (handled gracefully)
