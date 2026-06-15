/**
 * Directed Acyclic Graph (DAG) for Pull Request Dependencies.
 * Detects cycles and calculates the "Critical Path" (longest wait time chain).
 */

export type PRNode = {
  id: string;
  waitTimeHours: number;
  dependsOn: string[]; // IDs of PRs this PR is blocked by
};

export class PRDependencyGraph {
  private adjacencyList: Map<string, string[]> = new Map();
  private weights: Map<string, number> = new Map();

  constructor(nodes: PRNode[]) {
    for (const node of nodes) {
      this.weights.set(node.id, node.waitTimeHours);
      this.adjacencyList.set(node.id, node.dependsOn);
    }
  }

  /**
   * Detects if there is a circular dependency (e.g., PR A -> PR B -> PR A)
   * using Depth First Search (DFS) coloring algorithm.
   */
  hasCircularDependency(): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (nodeId: string): boolean => {
      visited.add(nodeId);
      recursionStack.add(nodeId);

      const neighbors = this.adjacencyList.get(nodeId) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor) && dfs(neighbor)) {
          return true;
        } else if (recursionStack.has(neighbor)) {
          return true; // Cycle detected
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const [nodeId] of this.adjacencyList) {
      if (!visited.has(nodeId)) {
        if (dfs(nodeId)) return true;
      }
    }
    return false;
  }

  /**
   * Calculates the critical path using topological sort and dynamic programming.
   * Finds the longest total wait time sequence blocking a deployment.
   */
  getCriticalPath(): { path: string[], totalWaitTime: number } {
    if (this.hasCircularDependency()) {
      throw new Error("Cannot calculate critical path: Circular dependency detected");
    }

    const memo = new Map<string, { path: string[], totalWaitTime: number }>();

    const dfsLongestPath = (nodeId: string): { path: string[], totalWaitTime: number } => {
      if (memo.has(nodeId)) return memo.get(nodeId)!;

      const neighbors = this.adjacencyList.get(nodeId) || [];
      let maxChildPath: string[] = [];
      let maxChildWait = 0;

      for (const neighbor of neighbors) {
        const childRes = dfsLongestPath(neighbor);
        if (childRes.totalWaitTime > maxChildWait) {
          maxChildWait = childRes.totalWaitTime;
          maxChildPath = childRes.path;
        }
      }

      const result = {
        path: [nodeId, ...maxChildPath],
        totalWaitTime: (this.weights.get(nodeId) || 0) + maxChildWait
      };

      memo.set(nodeId, result);
      return result;
    };

    let globalMaxPath: string[] = [];
    let globalMaxWait = 0;

    for (const [nodeId] of this.adjacencyList) {
      const res = dfsLongestPath(nodeId);
      if (res.totalWaitTime > globalMaxWait) {
        globalMaxWait = res.totalWaitTime;
        globalMaxPath = res.path;
      }
    }

    return { path: globalMaxPath, totalWaitTime: globalMaxWait };
  }
}
