/**
 * HPO API Client - Handles HTTP requests to the Human Phenotype Ontology API
 * Base URL: https://ontology.jax.org/api/hp/
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  OntologyTerm,
  SimpleOntologyTerm,
  SearchResult,
  SearchParams,
  HierarchyParams,
  ApiResponse
} from '../types/hpo.js';

export class HPOApiClient {
  private readonly client: AxiosInstance;
  private readonly baseURL = 'https://ontology.jax.org/api/hp';

  constructor() {
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'HPO-MCP-Server/1.0.0'
      }
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          // Server responded with error status
          throw new Error(`HPO API Error (${error.response.status}): ${error.response.data?.message || error.message}`);
        } else if (error.request) {
          // Request was made but no response received
          throw new Error('HPO API is not responding. Please check your internet connection.');
        } else {
          // Something else happened
          throw new Error(`Request error: ${error.message}`);
        }
      }
    );
  }

  /**
   * Search for HPO terms by keyword, ID, or synonym
   */
  async searchTerms(params: SearchParams): Promise<ApiResponse<SearchResult>> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('q', params.q);
      
      if (params.max) searchParams.append('max', params.max.toString());
      if (params.offset) searchParams.append('offset', params.offset.toString());
      if (params.category) {
        params.category.forEach(cat => searchParams.append('category', cat));
      }

      const response: AxiosResponse = await this.client.get(`/search?${searchParams.toString()}`);
      
      return {
        data: {
          terms: response.data.terms || response.data || [],
          totalResults: response.data.totalResults,
          page: response.data.page,
          size: response.data.size
        },
        status: response.status
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 500
      };
    }
  }

  /**
   * Get all HPO terms with pagination
   */
  async getAllTerms(max?: number, offset?: number): Promise<ApiResponse<SimpleOntologyTerm[]>> {
    try {
      const params = new URLSearchParams();
      if (max) params.append('max', max.toString());
      if (offset) params.append('offset', offset.toString());

      const response: AxiosResponse = await this.client.get(`/terms?${params.toString()}`);
      
      return {
        data: response.data.terms || response.data || [],
        status: response.status
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 500
      };
    }
  }

  /**
   * Get detailed information about a specific HPO term by ID
   */
  async getTerm(id: string): Promise<ApiResponse<OntologyTerm>> {
    try {
      // Ensure ID has proper format (HP:XXXXXXX)
      const formattedId = this.formatHPOId(id);
      const response: AxiosResponse = await this.client.get(`/terms/${encodeURIComponent(formattedId)}`);
      
      return {
        data: response.data,
        status: response.status
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 500
      };
    }
  }

  /**
   * Get ancestors of an HPO term
   */
  async getAncestors(params: HierarchyParams): Promise<ApiResponse<SimpleOntologyTerm[]>> {
    try {
      const formattedId = this.formatHPOId(params.id);
      const searchParams = new URLSearchParams();
      if (params.max) searchParams.append('max', params.max.toString());
      if (params.offset) searchParams.append('offset', params.offset.toString());

      const response: AxiosResponse = await this.client.get(
        `/terms/${encodeURIComponent(formattedId)}/ancestors?${searchParams.toString()}`
      );
      
      return {
        data: response.data.terms || response.data || [],
        status: response.status
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 500
      };
    }
  }

  /**
   * Get direct parents of an HPO term
   */
  async getParents(params: HierarchyParams): Promise<ApiResponse<SimpleOntologyTerm[]>> {
    try {
      const formattedId = this.formatHPOId(params.id);
      const searchParams = new URLSearchParams();
      if (params.max) searchParams.append('max', params.max.toString());
      if (params.offset) searchParams.append('offset', params.offset.toString());

      const response: AxiosResponse = await this.client.get(
        `/terms/${encodeURIComponent(formattedId)}/parents?${searchParams.toString()}`
      );
      
      return {
        data: response.data.terms || response.data || [],
        status: response.status
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 500
      };
    }
  }

  /**
   * Get direct children of an HPO term
   */
  async getChildren(params: HierarchyParams): Promise<ApiResponse<SimpleOntologyTerm[]>> {
    try {
      const formattedId = this.formatHPOId(params.id);
      const searchParams = new URLSearchParams();
      if (params.max) searchParams.append('max', params.max.toString());
      if (params.offset) searchParams.append('offset', params.offset.toString());

      const response: AxiosResponse = await this.client.get(
        `/terms/${encodeURIComponent(formattedId)}/children?${searchParams.toString()}`
      );
      
      return {
        data: response.data.terms || response.data || [],
        status: response.status
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 500
      };
    }
  }

  /**
   * Get all descendants of an HPO term
   */
  async getDescendants(params: HierarchyParams): Promise<ApiResponse<SimpleOntologyTerm[]>> {
    try {
      const formattedId = this.formatHPOId(params.id);
      const searchParams = new URLSearchParams();
      if (params.max) searchParams.append('max', params.max.toString());
      if (params.offset) searchParams.append('offset', params.offset.toString());

      const response: AxiosResponse = await this.client.get(
        `/terms/${encodeURIComponent(formattedId)}/descendants?${searchParams.toString()}`
      );
      
      return {
        data: response.data.terms || response.data || [],
        status: response.status
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 500
      };
    }
  }

  /**
   * Format HPO ID to ensure proper format (HP:XXXXXXX)
   */
  formatHPOId(id: string): string {
    // If it already starts with HP:, return as-is
    if (id.startsWith('HP:')) {
      return id;
    }
    
    // If it's just numbers, add HP: prefix
    if (/^\d+$/.test(id)) {
      return `HP:${id.padStart(7, '0')}`;
    }
    
    // Otherwise, return as-is and let the API handle validation
    return id;
  }

  /**
   * Validate if a string looks like a valid HPO ID
   */
  isValidHPOId(id: string): boolean {
    return /^HP:\d{7}$/.test(id) || /^\d{7}$/.test(id);
  }
}
