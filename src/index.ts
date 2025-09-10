#!/usr/bin/env node

/**
 * HPO MCP Server - A Model Context Protocol server for the Human Phenotype Ontology API
 * 
 * This server provides tools to interact with the HPO API including:
 * - Searching for HPO terms by keyword, ID, or synonym
 * - Getting detailed information about specific HPO terms
 * - Listing all HPO terms with pagination
 * - Exploring hierarchical relationships (ancestors, parents, children, descendants)
 * 
 * The HPO contains over 18,000 terms describing human phenotypic abnormalities
 * and is widely used in genetic research and clinical diagnostics.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";

import { HPOHandlers } from "./handlers/hpo-handlers.js";

/**
 * Create an MCP server with HPO functionality
 */
const server = new Server(
  {
    name: "hpo-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Initialize HPO handlers
const hpoHandlers = new HPOHandlers();

/**
 * Handler that lists all available HPO tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "search_hpo_terms",
        description: "Search for HPO terms by keyword, ID, or synonym. Supports pagination and filtering.",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query - can be a keyword, HPO ID (e.g., HP:0001234), or synonym"
            },
            max: {
              type: "number",
              description: "Maximum number of results to return (default: 20, max: 100)",
              minimum: 1,
              maximum: 100
            },
            offset: {
              type: "number",
              description: "Number of results to skip for pagination (default: 0)",
              minimum: 0
            },
            category: {
              type: "array",
              items: { type: "string" },
              description: "Filter by specific HPO categories (optional)"
            }
          },
          required: ["query"]
        }
      },
      {
        name: "get_hpo_term",
        description: "Get detailed information about a specific HPO term by its ID",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "HPO term ID (e.g., HP:0001234 or just 0001234)"
            }
          },
          required: ["id"]
        }
      },
      {
        name: "get_all_hpo_terms",
        description: "Get a list of all HPO terms with pagination support",
        inputSchema: {
          type: "object",
          properties: {
            max: {
              type: "number",
              description: "Maximum number of terms to return (default: 20, max: 100)",
              minimum: 1,
              maximum: 100
            },
            offset: {
              type: "number",
              description: "Number of terms to skip for pagination (default: 0)",
              minimum: 0
            }
          }
        }
      },
      {
        name: "get_hpo_ancestors",
        description: "Get all ancestor terms for a given HPO term (all terms higher in the hierarchy)",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "HPO term ID (e.g., HP:0001234 or just 0001234)"
            },
            max: {
              type: "number",
              description: "Maximum number of ancestors to return (default: 50)",
              minimum: 1,
              maximum: 200
            },
            offset: {
              type: "number",
              description: "Number of results to skip for pagination (default: 0)",
              minimum: 0
            }
          },
          required: ["id"]
        }
      },
      {
        name: "get_hpo_parents",
        description: "Get direct parent terms for a given HPO term (one level up in the hierarchy)",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "HPO term ID (e.g., HP:0001234 or just 0001234)"
            },
            max: {
              type: "number",
              description: "Maximum number of parents to return (default: 20)",
              minimum: 1,
              maximum: 100
            },
            offset: {
              type: "number",
              description: "Number of results to skip for pagination (default: 0)",
              minimum: 0
            }
          },
          required: ["id"]
        }
      },
      {
        name: "get_hpo_children",
        description: "Get direct child terms for a given HPO term (one level down in the hierarchy)",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "HPO term ID (e.g., HP:0001234 or just 0001234)"
            },
            max: {
              type: "number",
              description: "Maximum number of children to return (default: 20)",
              minimum: 1,
              maximum: 100
            },
            offset: {
              type: "number",
              description: "Number of results to skip for pagination (default: 0)",
              minimum: 0
            }
          },
          required: ["id"]
        }
      },
      {
        name: "get_hpo_descendants",
        description: "Get all descendant terms for a given HPO term (all terms lower in the hierarchy)",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "HPO term ID (e.g., HP:0001234 or just 0001234)"
            },
            max: {
              type: "number",
              description: "Maximum number of descendants to return (default: 50, max: 100)",
              minimum: 1,
              maximum: 100
            },
            offset: {
              type: "number",
              description: "Number of results to skip for pagination (default: 0)",
              minimum: 0
            }
          },
          required: ["id"]
        }
      },
      {
        name: "validate_hpo_id",
        description: "Validate if a given string is a valid HPO ID format and check if the term exists",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "ID to validate (e.g., HP:0001234, 0001234, or any string)"
            }
          },
          required: ["id"]
        }
      },
      {
        name: "get_hpo_term_path",
        description: "Get the full hierarchical path from root to a specific HPO term",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "HPO term ID (e.g., HP:0001234 or just 0001234)"
            }
          },
          required: ["id"]
        }
      },
      {
        name: "compare_hpo_terms",
        description: "Compare two HPO terms and find their relationship and common ancestors",
        inputSchema: {
          type: "object",
          properties: {
            term1: {
              type: "string",
              description: "First HPO term ID (e.g., HP:0001234)"
            },
            term2: {
              type: "string",
              description: "Second HPO term ID (e.g., HP:0005678)"
            }
          },
          required: ["term1", "term2"]
        }
      },
      {
        name: "get_hpo_term_stats",
        description: "Get comprehensive statistics and analysis for an HPO term including hierarchy counts and properties",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "HPO term ID (e.g., HP:0001234 or just 0001234)"
            }
          },
          required: ["id"]
        }
      },
      {
        name: "batch_get_hpo_terms",
        description: "Retrieve multiple HPO terms in a single request (maximum 20 terms)",
        inputSchema: {
          type: "object",
          properties: {
            ids: {
              type: "array",
              items: { type: "string" },
              description: "Array of HPO term IDs to retrieve",
              maxItems: 20
            }
          },
          required: ["ids"]
        }
      }
    ]
  };
});

/**
 * Handler for executing HPO tools
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "search_hpo_terms":
        return await hpoHandlers.searchHPOTerms(args);

      case "get_hpo_term":
        return await hpoHandlers.getHPOTerm(args);

      case "get_all_hpo_terms":
        return await hpoHandlers.getAllHPOTerms(args);

      case "get_hpo_ancestors":
        return await hpoHandlers.getHPOAncestors(args);

      case "get_hpo_parents":
        return await hpoHandlers.getHPOParents(args);

      case "get_hpo_children":
        return await hpoHandlers.getHPOChildren(args);

      case "get_hpo_descendants":
        return await hpoHandlers.getHPODescendants(args);

      case "validate_hpo_id":
        return await hpoHandlers.validateHPOId(args);

      case "get_hpo_term_path":
        return await hpoHandlers.getHPOTermPath(args);

      case "compare_hpo_terms":
        return await hpoHandlers.compareHPOTerms(args);

      case "get_hpo_term_stats":
        return await hpoHandlers.getHPOTermStats(args);

      case "batch_get_hpo_terms":
        return await hpoHandlers.batchGetHPOTerms(args);

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${name}`
        );
    }
  } catch (error) {
    // Handle both McpError and regular errors
    if (error instanceof McpError) {
      throw error;
    }

    // Convert regular errors to appropriate MCP errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    if (errorMessage.includes('required')) {
      throw new McpError(ErrorCode.InvalidParams, errorMessage);
    }
    
    return {
      content: [{
        type: "text",
        text: `Error: ${errorMessage}`
      }],
      isError: true
    };
  }
});

/**
 * Start the server using stdio transport
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("HPO MCP server running on stdio");
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.error('Shutting down HPO MCP server...');
  await server.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.error('Shutting down HPO MCP server...');
  await server.close();
  process.exit(0);
});

// Start the server
main().catch((error) => {
  console.error("HPO MCP Server error:", error);
  process.exit(1);
});
