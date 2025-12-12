# backend/solver.py
# Placeholder BFS solver. Replace with your solver if you prefer.

from collections import deque

def solve_maze_bfs(grid, start, end):
    """
    grid: 2D list of 0 (free) and 1 (wall)
    start, end: (r,c)
    returns: list of [r,c] from start to end inclusive, or None
    """
    if not grid:
        return None
    rows = len(grid)
    cols = len(grid[0])

    sr, sc = start
    er, ec = end

    # Validate start/end in bounds
    if not (0 <= sr < rows and 0 <= sc < cols and 0 <= er < rows and 0 <= ec < cols):
        return None

    # Force start and end to be free (0) to ensure pathfinding can start/finish
    # This handles cases where the UI overlay hides a wall at the start/end coords
    grid[sr][sc] = 0
    grid[er][ec] = 0

    q = deque()
    q.append((sr, sc))
    parent = { (sr, sc): None }
    dirs = [(1,0),(-1,0),(0,1),(0,-1)]

    while q:
        r, c = q.popleft()
        if (r, c) == (er, ec):
            break
        for dr, dc in dirs:
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 0 and (nr,nc) not in parent:
                parent[(nr,nc)] = (r,c)
                q.append((nr,nc))

    if (er, ec) not in parent:
        return None

    # Reconstruct path
    path = []
    cur = (er, ec)
    while cur:
        path.append([cur[0], cur[1]])  # return as list for JSON
        cur = parent[cur]
    path.reverse()
    return path
