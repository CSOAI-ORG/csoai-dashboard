# RLMAI Cross-Training Network Visualization - Design Notes

## Source
https://ai-architect-launch.lovable.app

## Key Design Elements

### Layout
- Central hub node: "RLMAI" with live counter "12,872+ daily"
- 27 company nodes arranged in an organic, orbital pattern around the central hub
- Nodes at varying distances from center creating depth
- Some nodes closer (inner orbit), some further (outer orbit)

### Node Design
- Circular nodes with company names
- Different sizes for visual hierarchy
- Color coding by category:
  - Blue circles: AI Safety companies (CSOAI, CEASAI, CouncilOf, SafetyOf, BiasDetect, Transparen, AGISafe, ISISecurity, DataPrivac, SuicideStop, EthicalGov)
  - Other colors for SaaS AI and Traditional businesses
- Labels truncated with "..." for long names

### Animation
- Real-time data flow visualization
- Animated lines/connections between nodes
- Live counter incrementing
- Pulsing/glowing effects on active nodes

### Companies Listed (27 total)
1. CSOAI
2. CEASAI
3. CouncilOf
4. SafetyOf
5. BiasDetect...
6. Transparen...
7. AGISafe
8. ISISecurity
9. DataPrivac...
10. SuicideStop
11. EthicalGov...
12. LoopFactory
13. KoiKeeper
14. FishKeeper
15. PlantHire
16. Muckaway
17. GrabHire
18. Commercial...
19. OptiMobile
20. ProofOf
21. Landlord
22. DIYHelp
23. PokerHUD
24. LandLaw
25. NetworkNick
26. Templeman ...
27. IOK Farm

### Categories (Legend)
- AI Safety (blue)
- SaaS AI (green/teal)
- Traditional (purple/pink)

### Stats Display
- "12,872 decisions today"
- "Live network" indicator
- Incrementing counter animation

### Visual Style
- Clean, modern design
- Soft shadows and depth
- Organic node placement (not rigid grid)
- Connecting lines showing data flow
- Gradient backgrounds on nodes
- Subtle animations for "live" feel

## Implementation Plan for CSOAI Dashboard
1. Create NetworkVisualization component
2. Use SVG or Canvas for rendering
3. Implement animated connections with CSS/JS
4. Add live counter with incrementing animation
5. Color-code nodes by category
6. Add hover states for node details
7. Make responsive for different screen sizes
