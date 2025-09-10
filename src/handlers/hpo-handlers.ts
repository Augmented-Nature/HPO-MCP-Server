/**
 * HPO Tool Handlers - Implementation of MCP tools for Human Phenotype Ontology functionality
 */

import { HPOApiClient } from '../utils/api-client.js';
import { SearchParams, HierarchyParams } from '../types/hpo.js';

export class HPOHandlers {
  private apiClient: HPOApiClient;

  constructor() {
    this.apiClient = new HPOApiClient();
  }

  /**
   * Search for HPO terms by keyword, ID, or synonym
   */
  async searchHPOTerms(args: any) {
    if (!args.query || typeof args.query !== 'string') {
      throw new Error('Query parameter is required and must be a string');
    }

    const searchParams: SearchParams = {
      q: args.query,
      max: args.max && typeof args.max === 'number' ? args.max : 20,
      offset: args.offset && typeof args.offset === 'number' ? args.offset : 0,
      category: args.category && Array.isArray(args.category) ? args.category : undefined
    };

    const result = await this.apiClient.searchTerms(searchParams);

    if (result.error) {
      return {
        content: [{
          type: "text",
          text: `Error searching HPO terms: ${result.error}`
        }],
        isError: true
      };
    }

    const terms = result.data?.terms || [];
    const totalResults = result.data?.totalResults || terms.length;

    if (terms.length === 0) {
      return {
        content: [{
          type: "text",
          text: `No HPO terms found for query: "${args.query}"`
        }]
      };
    }

    const formattedResults = terms.map(term => {
      const synonyms = term.synonyms && term.synonyms.length > 0 
        ? `\n  Synonyms: ${term.synonyms.join(', ')}` 
        : '';
      const definition = term.definition 
        ? `\n  Definition: ${term.definition}` 
        : '';
      
      return `• ${term.id}: ${term.name}${definition}${synonyms}`;
    }).join('\n\n');

    const pagination = searchParams.offset! > 0 || terms.length >= (searchParams.max || 20)
      ? `\n\nShowing results ${searchParams.offset! + 1}-${searchParams.offset! + terms.length} of ${totalResults} total results.`
      : terms.length < totalResults
        ? `\n\nShowing first ${terms.length} of ${totalResults} total results.`
        : '';

    return {
      content: [{
        type: "text",
        text: `Found ${totalResults} HPO terms matching "${args.query}":\n\n${formattedResults}${pagination}`
      }]
    };
  }

  /**
   * Get detailed information about a specific HPO term
   */
  async getHPOTerm(args: any) {
    if (!args.id || typeof args.id !== 'string') {
      throw new Error('HPO ID parameter is required and must be a string');
    }

    const result = await this.apiClient.getTerm(args.id);

    if (result.error) {
      return {
        content: [{
          type: "text",
          text: `Error retrieving HPO term ${args.id}: ${result.error}`
        }],
        isError: true
      };
    }

    const term = result.data;
    if (!term) {
      return {
        content: [{
          type: "text",
          text: `HPO term ${args.id} not found`
        }]
      };
    }

    let output = `**HPO Term: ${term.id}**\n`;
    output += `**Name:** ${term.name}\n\n`;

    if (term.definition) {
      output += `**Definition:** ${term.definition}\n\n`;
    }

    if (term.comment) {
      output += `**Comment:** ${term.comment}\n\n`;
    }

    if (term.synonyms && term.synonyms.length > 0) {
      output += `**Synonyms:** ${term.synonyms.join(', ')}\n\n`;
    }

    if (term.xrefs && term.xrefs.length > 0) {
      output += `**Cross-references:** ${term.xrefs.join(', ')}\n\n`;
    }

    if (term.alternativeIds && term.alternativeIds.length > 0) {
      output += `**Alternative IDs:** ${term.alternativeIds.join(', ')}\n\n`;
    }

    if (term.parents && term.parents.length > 0) {
      output += `**Parent Terms:**\n${term.parents.map(p => `  • ${p.id}: ${p.name}`).join('\n')}\n\n`;
    }

    if (term.children && term.children.length > 0) {
      output += `**Child Terms:**\n${term.children.map(c => `  • ${c.id}: ${c.name}`).join('\n')}\n\n`;
    }

    if (term.isObsolete) {
      output += `**Status:** This term is obsolete`;
      if (term.replacement) {
        output += ` (replaced by ${term.replacement})`;
      }
      output += '\n\n';
    }

    return {
      content: [{
        type: "text",
        text: output.trim()
      }]
    };
  }

  /**
   * Get all HPO terms with pagination
   */
  async getAllHPOTerms(args: any) {
    const max = args.max && typeof args.max === 'number' ? Math.min(args.max, 100) : 20;
    const offset = args.offset && typeof args.offset === 'number' ? args.offset : 0;

    const result = await this.apiClient.getAllTerms(max, offset);

    if (result.error) {
      return {
        content: [{
          type: "text",
          text: `Error retrieving HPO terms: ${result.error}`
        }],
        isError: true
      };
    }

    const terms = result.data || [];

    if (terms.length === 0) {
      return {
        content: [{
          type: "text",
          text: `No HPO terms found at offset ${offset}`
        }]
      };
    }

    const formattedTerms = terms.map(term => `• ${term.id}: ${term.name}`).join('\n');

    return {
      content: [{
        type: "text",
        text: `HPO Terms (showing ${terms.length} terms starting from position ${offset + 1}):\n\n${formattedTerms}\n\nTo see more terms, use a higher offset value.`
      }]
    };
  }

  /**
   * Get ancestors of an HPO term
   */
  async getHPOAncestors(args: any) {
    if (!args.id || typeof args.id !== 'string') {
      throw new Error('HPO ID parameter is required and must be a string');
    }

    const params: HierarchyParams = {
      id: args.id,
      max: args.max && typeof args.max === 'number' ? args.max : 50,
      offset: args.offset && typeof args.offset === 'number' ? args.offset : 0
    };

    const result = await this.apiClient.getAncestors(params);

    if (result.error) {
      return {
        content: [{
          type: "text",
          text: `Error retrieving ancestors for ${args.id}: ${result.error}`
        }],
        isError: true
      };
    }

    const ancestors = result.data || [];

    if (ancestors.length === 0) {
      return {
        content: [{
          type: "text",
          text: `No ancestors found for HPO term ${args.id}`
        }]
      };
    }

    const formattedAncestors = ancestors.map(ancestor => `• ${ancestor.id}: ${ancestor.name}`).join('\n');

    return {
      content: [{
        type: "text",
        text: `Ancestors of ${args.id}:\n\n${formattedAncestors}`
      }]
    };
  }

  /**
   * Get direct parents of an HPO term
   */
  async getHPOParents(args: any) {
    if (!args.id || typeof args.id !== 'string') {
      throw new Error('HPO ID parameter is required and must be a string');
    }

    const params: HierarchyParams = {
      id: args.id,
      max: args.max && typeof args.max === 'number' ? args.max : 20,
      offset: args.offset && typeof args.offset === 'number' ? args.offset : 0
    };

    const result = await this.apiClient.getParents(params);

    if (result.error) {
      return {
        content: [{
          type: "text",
          text: `Error retrieving parents for ${args.id}: ${result.error}`
        }],
        isError: true
      };
    }

    const parents = result.data || [];

    if (parents.length === 0) {
      return {
        content: [{
          type: "text",
          text: `No direct parents found for HPO term ${args.id}`
        }]
      };
    }

    const formattedParents = parents.map(parent => `• ${parent.id}: ${parent.name}`).join('\n');

    return {
      content: [{
        type: "text",
        text: `Direct parents of ${args.id}:\n\n${formattedParents}`
      }]
    };
  }

  /**
   * Get direct children of an HPO term
   */
  async getHPOChildren(args: any) {
    if (!args.id || typeof args.id !== 'string') {
      throw new Error('HPO ID parameter is required and must be a string');
    }

    const params: HierarchyParams = {
      id: args.id,
      max: args.max && typeof args.max === 'number' ? args.max : 20,
      offset: args.offset && typeof args.offset === 'number' ? args.offset : 0
    };

    const result = await this.apiClient.getChildren(params);

    if (result.error) {
      return {
        content: [{
          type: "text",
          text: `Error retrieving children for ${args.id}: ${result.error}`
        }],
        isError: true
      };
    }

    const children = result.data || [];

    if (children.length === 0) {
      return {
        content: [{
          type: "text",
          text: `No direct children found for HPO term ${args.id}`
        }]
      };
    }

    const formattedChildren = children.map(child => `• ${child.id}: ${child.name}`).join('\n');

    return {
      content: [{
        type: "text",
        text: `Direct children of ${args.id}:\n\n${formattedChildren}`
      }]
    };
  }

  /**
   * Get all descendants of an HPO term
   */
  async getHPODescendants(args: any) {
    if (!args.id || typeof args.id !== 'string') {
      throw new Error('HPO ID parameter is required and must be a string');
    }

    const params: HierarchyParams = {
      id: args.id,
      max: args.max && typeof args.max === 'number' ? Math.min(args.max, 100) : 50,
      offset: args.offset && typeof args.offset === 'number' ? args.offset : 0
    };

    const result = await this.apiClient.getDescendants(params);

    if (result.error) {
      return {
        content: [{
          type: "text",
          text: `Error retrieving descendants for ${args.id}: ${result.error}`
        }],
        isError: true
      };
    }

    const descendants = result.data || [];

    if (descendants.length === 0) {
      return {
        content: [{
          type: "text",
          text: `No descendants found for HPO term ${args.id}`
        }]
      };
    }

    const formattedDescendants = descendants.map(descendant => `• ${descendant.id}: ${descendant.name}`).join('\n');

    return {
      content: [{
        type: "text",
        text: `Descendants of ${args.id} (showing ${descendants.length} terms):\n\n${formattedDescendants}\n\n${descendants.length >= (params.max || 50) ? 'Use offset parameter to see more results.' : ''}`
      }]
    };
  }

  /**
   * Validate if a given string is a valid HPO ID format
   */
  async validateHPOId(args: any) {
    if (!args.id || typeof args.id !== 'string') {
      throw new Error('ID parameter is required and must be a string');
    }

    const isValid = this.apiClient.isValidHPOId(args.id);
    const formattedId = this.apiClient.formatHPOId(args.id);

    if (isValid) {
      // Try to fetch the term to verify it exists
      const result = await this.apiClient.getTerm(args.id);
      
      if (result.error) {
        return {
          content: [{
            type: "text",
            text: `ID "${args.id}" has valid HPO format but term not found: ${result.error}`
          }]
        };
      }

      return {
        content: [{
          type: "text",
          text: `✅ Valid HPO ID: "${args.id}" (formatted as "${formattedId}")\nTerm exists: ${result.data?.name || 'Unknown'}`
        }]
      };
    } else {
      return {
        content: [{
          type: "text",
          text: `❌ Invalid HPO ID format: "${args.id}"\nValid format: HP:XXXXXXX (e.g., HP:0000001)`
        }]
      };
    }
  }

  /**
   * Get the full hierarchical path from root to a specific HPO term
   */
  async getHPOTermPath(args: any) {
    if (!args.id || typeof args.id !== 'string') {
      throw new Error('HPO ID parameter is required and must be a string');
    }

    // Get the term details first
    const termResult = await this.apiClient.getTerm(args.id);
    if (termResult.error) {
      return {
        content: [{
          type: "text",
          text: `Error retrieving term ${args.id}: ${termResult.error}`
        }],
        isError: true
      };
    }

    // Get all ancestors
    const ancestorsResult = await this.apiClient.getAncestors({ id: args.id, max: 200, offset: 0 });
    if (ancestorsResult.error) {
      return {
        content: [{
          type: "text",
          text: `Error retrieving ancestors for ${args.id}: ${ancestorsResult.error}`
        }],
        isError: true
      };
    }

    const ancestors = ancestorsResult.data || [];
    const term = termResult.data;

    if (!term) {
      return {
        content: [{
          type: "text",
          text: `Term ${args.id} not found`
        }]
      };
    }

    // Build the path (root to current term)
    const pathTerms = [...ancestors.reverse(), { id: term.id, name: term.name }];
    const formattedPath = pathTerms.map((t, index) => {
      const indent = '  '.repeat(index);
      return `${indent}${index === pathTerms.length - 1 ? '→' : '├'} ${t.id}: ${t.name}`;
    }).join('\n');

    return {
      content: [{
        type: "text",
        text: `Hierarchical path to ${args.id}:\n\n${formattedPath}\n\nPath depth: ${pathTerms.length - 1} levels`
      }]
    };
  }

  /**
   * Compare two HPO terms and find their relationship
   */
  async compareHPOTerms(args: any) {
    if (!args.term1 || !args.term2 || typeof args.term1 !== 'string' || typeof args.term2 !== 'string') {
      throw new Error('Both term1 and term2 parameters are required and must be strings');
    }

    // Get details for both terms
    const [term1Result, term2Result] = await Promise.all([
      this.apiClient.getTerm(args.term1),
      this.apiClient.getTerm(args.term2)
    ]);

    if (term1Result.error || term2Result.error) {
      return {
        content: [{
          type: "text",
          text: `Error retrieving terms: ${term1Result.error || term2Result.error}`
        }],
        isError: true
      };
    }

    if (!term1Result.data || !term2Result.data) {
      return {
        content: [{
          type: "text",
          text: `One or both terms not found: ${args.term1}, ${args.term2}`
        }]
      };
    }

    // Get ancestors for both terms
    const [ancestors1Result, ancestors2Result] = await Promise.all([
      this.apiClient.getAncestors({ id: args.term1, max: 200, offset: 0 }),
      this.apiClient.getAncestors({ id: args.term2, max: 200, offset: 0 })
    ]);

    const ancestors1 = ancestors1Result.data || [];
    const ancestors2 = ancestors2Result.data || [];

    // Find common ancestors
    const ancestors1Ids = new Set(ancestors1.map(a => a.id));
    const commonAncestors = ancestors2.filter(a => ancestors1Ids.has(a.id));

    // Check direct relationship
    let relationship = 'No direct relationship';
    if (ancestors1.some(a => a.id === args.term2)) {
      relationship = `${args.term1} is a descendant of ${args.term2}`;
    } else if (ancestors2.some(a => a.id === args.term1)) {
      relationship = `${args.term2} is a descendant of ${args.term1}`;
    } else if (commonAncestors.length > 0) {
      relationship = `Related through common ancestors`;
    }

    let output = `**Comparison of HPO Terms:**\n\n`;
    output += `**Term 1:** ${args.term1}: ${term1Result.data.name}\n`;
    output += `**Term 2:** ${args.term2}: ${term2Result.data.name}\n\n`;
    output += `**Relationship:** ${relationship}\n\n`;

    if (commonAncestors.length > 0) {
      output += `**Common Ancestors (${commonAncestors.length}):**\n`;
      commonAncestors.slice(0, 10).forEach(ancestor => {
        output += `  • ${ancestor.id}: ${ancestor.name}\n`;
      });
      if (commonAncestors.length > 10) {
        output += `  ... and ${commonAncestors.length - 10} more\n`;
      }
    } else {
      output += `**Common Ancestors:** None found\n`;
    }

    return {
      content: [{
        type: "text",
        text: output
      }]
    };
  }

  /**
   * Get statistics about an HPO term
   */
  async getHPOTermStats(args: any) {
    if (!args.id || typeof args.id !== 'string') {
      throw new Error('HPO ID parameter is required and must be a string');
    }

    // Get term details and all relationships
    const [termResult, ancestorsResult, descendantsResult, parentsResult, childrenResult] = await Promise.all([
      this.apiClient.getTerm(args.id),
      this.apiClient.getAncestors({ id: args.id, max: 1000, offset: 0 }),
      this.apiClient.getDescendants({ id: args.id, max: 1000, offset: 0 }),
      this.apiClient.getParents({ id: args.id, max: 100, offset: 0 }),
      this.apiClient.getChildren({ id: args.id, max: 100, offset: 0 })
    ]);

    if (termResult.error) {
      return {
        content: [{
          type: "text",
          text: `Error retrieving term ${args.id}: ${termResult.error}`
        }],
        isError: true
      };
    }

    const term = termResult.data;
    if (!term) {
      return {
        content: [{
          type: "text",
          text: `Term ${args.id} not found`
        }]
      };
    }

    const ancestors = ancestorsResult.data || [];
    const descendants = descendantsResult.data || [];
    const parents = parentsResult.data || [];
    const children = childrenResult.data || [];

    let output = `**Statistics for ${args.id}:**\n\n`;
    output += `**Name:** ${term.name}\n\n`;
    
    if (term.definition) {
      output += `**Definition:** ${term.definition.substring(0, 200)}${term.definition.length > 200 ? '...' : ''}\n\n`;
    }

    output += `**Hierarchy Statistics:**\n`;
    output += `  • Ancestors: ${ancestors.length}\n`;
    output += `  • Direct Parents: ${parents.length}\n`;
    output += `  • Direct Children: ${children.length}\n`;
    output += `  • All Descendants: ${descendants.length}\n`;
    output += `  • Depth from Root: ${ancestors.length}\n\n`;

    output += `**Term Properties:**\n`;
    output += `  • Synonyms: ${term.synonyms?.length || 0}\n`;
    output += `  • Cross-references: ${term.xrefs?.length || 0}\n`;
    output += `  • Alternative IDs: ${term.alternativeIds?.length || 0}\n`;
    output += `  • Obsolete: ${term.isObsolete ? 'Yes' : 'No'}\n`;

    if (term.comment) {
      output += `\n**Comment:** ${term.comment.substring(0, 150)}${term.comment.length > 150 ? '...' : ''}`;
    }

    return {
      content: [{
        type: "text",
        text: output
      }]
    };
  }

  /**
   * Batch process multiple HPO terms
   */
  async batchGetHPOTerms(args: any) {
    if (!args.ids || !Array.isArray(args.ids)) {
      throw new Error('IDs parameter is required and must be an array of strings');
    }

    if (args.ids.length === 0) {
      return {
        content: [{
          type: "text",
          text: "No IDs provided"
        }]
      };
    }

    if (args.ids.length > 20) {
      return {
        content: [{
          type: "text",
          text: "Maximum 20 terms can be processed at once"
        }]
      };
    }

    const results = await Promise.all(
      args.ids.map(async (id: string) => {
        try {
          const result = await this.apiClient.getTerm(id);
          return {
            id,
            success: !result.error,
            data: result.data,
            error: result.error
          };
        } catch (error) {
          return {
            id,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    let output = `**Batch Processing Results:**\n\n`;
    output += `**Summary:** ${successful.length}/${args.ids.length} terms retrieved successfully\n\n`;

    if (successful.length > 0) {
      output += `**Successfully Retrieved Terms:**\n`;
      successful.forEach(result => {
        const term = result.data;
        output += `• ${result.id}: ${term?.name || 'Unknown'}\n`;
        if (term?.definition) {
          output += `  Definition: ${term.definition.substring(0, 100)}${term.definition.length > 100 ? '...' : ''}\n`;
        }
        output += '\n';
      });
    }

    if (failed.length > 0) {
      output += `**Failed Terms:**\n`;
      failed.forEach(result => {
        output += `• ${result.id}: ${result.error}\n`;
      });
    }

    return {
      content: [{
        type: "text",
        text: output
      }]
    };
  }

  /**
   * Format HPO ID to ensure proper format
   */
  formatHPOId(id: string): string {
    return this.apiClient.formatHPOId(id);
  }
}
