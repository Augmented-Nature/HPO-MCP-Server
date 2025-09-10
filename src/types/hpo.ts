/**
 * TypeScript interfaces for Human Phenotype Ontology (HPO) API data structures
 * Based on the HPO API documentation at https://ontology.jax.org/api/hp/docs
 */

/**
 * Complete ontology term information
 */
export interface OntologyTerm {
  id: string;
  name: string;
  definition?: string;
  comment?: string;
  synonyms?: string[];
  xrefs?: string[];
  alternativeIds?: string[];
  isObsolete?: boolean;
  replacement?: string;
  subset?: string[];
  children?: SimpleOntologyTerm[];
  parents?: SimpleOntologyTerm[];
  ancestors?: SimpleOntologyTerm[];
  descendants?: SimpleOntologyTerm[];
}

/**
 * Simple ontology term for hierarchical relationships
 */
export interface SimpleOntologyTerm {
  id: string;
  name: string;
}

/**
 * Search result from the HPO search endpoint
 */
export interface SearchResult {
  terms: SearchTerm[];
  totalResults?: number;
  page?: number;
  size?: number;
}

/**
 * Individual search term result
 */
export interface SearchTerm {
  id: string;
  name: string;
  definition?: string;
  synonyms?: string[];
  score?: number;
}

/**
 * Language information
 */
export interface Language {
  code: string;
  name: string;
}

/**
 * Translation information
 */
export interface Translation {
  language: Language;
  name?: string;
  definition?: string;
  synonyms?: string[];
  status?: TranslationStatus;
}

/**
 * Translation status
 */
export interface TranslationStatus {
  code: string;
  name: string;
}

/**
 * Search parameters for HPO API queries
 */
export interface SearchParams {
  q: string;
  max?: number;
  offset?: number;
  category?: string[];
}

/**
 * Hierarchy query parameters
 */
export interface HierarchyParams {
  id: string;
  max?: number;
  offset?: number;
}

/**
 * General API response wrapper
 */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

/**
 * Pagination information
 */
export interface PaginationInfo {
  page: number;
  size: number;
  totalResults: number;
  hasMore: boolean;
}
