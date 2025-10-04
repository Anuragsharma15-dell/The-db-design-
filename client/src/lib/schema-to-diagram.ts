import type { Node, Edge } from "@xyflow/react";

interface TableInfo {
  name: string;
  fields: string[];
  foreignKeys: { field: string; references: string }[];
}

export function parseSQLSchema(sql: string): TableInfo[] {
  const tables: TableInfo[] = [];
  
  // Match CREATE TABLE statements
  const tableRegex = /CREATE\s+TABLE\s+(\w+)\s*\(([\s\S]*?)\);/gi;
  let match;
  
  while ((match = tableRegex.exec(sql)) !== null) {
    const tableName = match[1];
    const tableBody = match[2];
    
    const fields: string[] = [];
    const foreignKeys: { field: string; references: string }[] = [];
    
    // Parse fields
    const lines = tableBody.split(',').map(l => l.trim());
    
    for (const line of lines) {
      // Skip constraint definitions
      if (line.toUpperCase().startsWith('CONSTRAINT') || 
          line.toUpperCase().startsWith('PRIMARY KEY') ||
          line.toUpperCase().startsWith('UNIQUE') ||
          line.toUpperCase().startsWith('CHECK') ||
          line.toUpperCase().startsWith('INDEX')) {
        continue;
      }
      
      // Check for foreign key
      const fkMatch = line.match(/FOREIGN\s+KEY\s*\((\w+)\)\s*REFERENCES\s+(\w+)/i);
      if (fkMatch) {
        foreignKeys.push({
          field: fkMatch[1],
          references: fkMatch[2]
        });
        continue;
      }
      
      // Regular field
      const fieldMatch = line.match(/^(\w+)\s+([A-Z0-9()]+)/i);
      if (fieldMatch) {
        const fieldName = fieldMatch[1];
        const fieldType = fieldMatch[2];
        const isPrimary = line.toUpperCase().includes('PRIMARY KEY');
        const isUnique = line.toUpperCase().includes('UNIQUE');
        const isNotNull = line.toUpperCase().includes('NOT NULL');
        
        let fieldStr = `${fieldName}: ${fieldType}`;
        if (isPrimary) fieldStr = `🔑 ${fieldStr}`;
        else if (isUnique) fieldStr = `⭐ ${fieldStr}`;
        
        fields.push(fieldStr);
      }
    }
    
    tables.push({ name: tableName, fields, foreignKeys });
  }
  
  return tables;
}

export function schemaToNodesAndEdges(sql: string): { nodes: Node[]; edges: Edge[] } {
  const tables = parseSQLSchema(sql);
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  
  // Create nodes in a grid layout
  const itemsPerRow = 3;
  const horizontalSpacing = 280;
  const verticalSpacing = 220;
  
  tables.forEach((table, index) => {
    const row = Math.floor(index / itemsPerRow);
    const col = index % itemsPerRow;
    
    const label = `${table.name}\n${table.fields.join('\n')}`;
    
    nodes.push({
      id: table.name,
      type: "default",
      data: { label },
      position: { 
        x: col * horizontalSpacing + 100, 
        y: row * verticalSpacing + 100 
      },
      style: {
        background: "hsl(var(--card))",
        border: "2px solid hsl(var(--primary))",
        borderRadius: "8px",
        padding: "12px",
        fontSize: "12px",
        fontFamily: "var(--font-mono)",
        minWidth: 220,
        whiteSpace: "pre-line",
      },
    });
    
    // Create edges for foreign keys
    table.foreignKeys.forEach((fk, fkIndex) => {
      edges.push({
        id: `${table.name}-${fk.references}-${fkIndex}`,
        source: table.name,
        target: fk.references,
        label: fk.field,
        type: "smoothstep",
        style: { stroke: "hsl(var(--primary))", strokeWidth: 2 },
        labelStyle: { fill: "hsl(var(--foreground))", fontSize: 10 },
        animated: true,
      });
    });
  });
  
  return { nodes, edges };
}
