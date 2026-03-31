# {{title}}

{{description}}

```mermaid
flowchart TD
    A[{{start_node}}] --> B{{{decision_node}}}
    B -->|Yes| C[{{yes_path}}]
    B -->|No| D[{{no_path}}]
    C --> E[{{end_node}}]
    D --> E
```

## Notes

- Modify the diagram type as needed: `flowchart`, `sequenceDiagram`, `stateDiagram-v2`, `classDiagram`, `erDiagram`, `gantt`
- See [Mermaid docs](https://mermaid.js.org/intro/) for full syntax
