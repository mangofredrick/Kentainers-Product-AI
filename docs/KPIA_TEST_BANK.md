# KPIA Product Intelligence Test Bank

## Purpose
This evaluation suite is used to validate the Kentainers Product Intelligence Agent (KPIA) across product discovery, specifications, applications, clarification, comparison, multi-document retrieval, and grounded-answer behavior.

## A. Product identification
1. What Kentank products are available?
2. Which Kentank is suitable for 5,000 litres?
3. Which Kentank is suitable for 6,000 litres?
4. Which Kentank is suitable for 8,000 litres?
5. Which Kentank is suitable for 10,000 litres?
6. Which Kentank is suitable for 16,000 litres?
7. Which Kentank is suitable for 24,000 litres?
8. What product has code CCV 600?
9. What product has code CCV 500?
10. What product has code CCV 1000?
11. What is the largest capacity listed in the catalogue?
12. What is the smallest capacity listed?
13. Show me Kentank products between 4,000 and 10,000 litres.
14. Show me products around 5,000 litres.
15. What options are available for approximately 10,000 litres?

## B. Specifications
16. What is the capacity of CCV 600?
17. What is the height of the 6,000-litre tank?
18. What is the diameter of the 6,000-litre tank?
19. What is the height of the 5,000-litre tank?
20. What is the diameter of the 5,000-litre tank?
21. What are the dimensions of the 8,000-litre tank?
22. What are the dimensions of the 10,000-litre short tank?
23. What are the dimensions of the 10,000-litre tank?
24. What are the dimensions of the 16,000-litre tank?
25. What are the dimensions of the 24,000-litre tank?
26. What are the listed gallon equivalents for the tank capacities?
27. Which tank has a capacity of 2,500 litres?
28. Which tank has a capacity of 3,500 litres?
29. Which tank has a capacity of 4,600 litres?
30. What tanks are available at exactly 5,000 litres?

## C. Comparison
31. Compare the two 5,000-litre tank options.
32. What is the difference between the two 5,000-litre tanks?
33. Compare the 5,000-litre and 6,000-litre tanks.
34. Compare the 6,000-litre and 8,000-litre tanks.
35. Compare the 8,000-litre and 10,000-litre tanks.
36. Compare the 10,000-litre short and standard options.
37. Which listed tank is taller: 5,000 or 6,000 litres?
38. Which is wider: the 5,000-litre or 6,000-litre tank?
39. Compare the capacity and dimensions of 4,000 and 5,000 litres.
40. Compare the 16,000-litre and 24,000-litre options.

## D. Applications
41. What are Kentank tanks used for?
42. Can Kentank be used for water storage?
43. Can Kentank be used for rainwater harvesting?
44. Can Kentank be used for irrigation?
45. I need a tank for rainwater harvesting. What information should I provide?
46. I need water storage for a farm. What should I consider?
47. I need approximately 6,000 litres for water storage.
48. I need approximately 10,000 litres for irrigation.
49. I need a tank for rainwater harvesting.
50. What applications are documented for Kentank?

## E. Customer requirements and clarification
51. I need a tank for my home. What information do you need?
52. I need a tank for a farm. Ask me the questions you need before recommending one.
53. My customer needs 6,000 litres. What else do you need to know?
54. I need 5,000 litres but I have limited installation space.
55. My customer wants to harvest rainwater. What questions should I ask?
56. I need a tank for irrigation.
57. I don't know which capacity I need. Help me determine what information is required.
58. The customer only says I need a water tank. What should I ask?
59. The customer wants a tank but hasn't specified the application.
60. What information should a sales representative collect before recommending a product?

## F. Pedal Hand Wash
61. What is the Pedal Hand Wash?
62. What sizes are available?
63. Is the Pedal Hand Wash available in 100 litres?
64. Is it available in 200 litres?
65. Is it available in 250 litres?
66. What does the Pedal Hand Wash include?
67. Does it come with a tap?
68. Does it come with a basin?
69. Does it come with a collection bucket?
70. What size is the collection bucket?
71. What applications does the Pedal Hand Wash have?
72. Can it be used for agriculture?
73. Can it be used for indoor applications?
74. Can it be used outdoors?
75. What material is the Pedal Hand Wash made from?
76. What are the main features of the Pedal Hand Wash?
77. Does it require hand contact?
78. How does it support hygiene?
79. What types of stands are available?
80. What types of customers could use this product?

## G. Permawell
81. What is Permawell?
82. What is Permawell designed for?
83. What type of well does Permawell line?
84. What material is Permawell made from?
85. What is the expected lifespan of Permawell?
86. How long does installation take?
87. Can Permawell be used for homes?
88. Can Permawell be used for livestock?
89. Can Permawell be used for agriculture?
90. Can Permawell be used by schools?
91. Can Permawell be used by churches?
92. Can Permawell be used by mosques?
93. What accessories are provided?
94. Is Permawell easy to transport?
95. Is Permawell easy to install?

## H. Multi-document and agent tests
96. What Kentainers products are suitable for water-related applications?
97. Compare Kentank and Permawell.
98. What is the difference between a water storage tank and a shallow-well liner?
99. Which document contains information about Pedal Hand Wash?
100. Which document contains the Kentank capacity table?

## I. High-value demonstration prompts
101. I need 6,000 litres.
102. I need a 6,000-litre tank for water storage.
103. Give me the difference between the two 5,000-litre options.
104. I need a solution for a shallow hand-dug well. What Kentainers product should I investigate?
105. I need a hand-washing solution for a school.
106. What is the current price of the 6,000-litre tank?
107. What is the warranty period for CCV 600?
108. My customer needs water storage for a farm, approximately 5,000 litres. Help me identify the relevant option and what I should confirm with the customer.
109. A customer needs 5,000 litres but has limited vertical space. What should I compare?
110. I need a product for a rural household with a shallow hand-dug well. What should I investigate?

## Expected agent behavior
- Use the indexed Kentainers documents as the source of truth.
- Ask clarifying questions when the requirement is ambiguous.
- Distinguish products that share the same nominal capacity but have different dimensions.
- Do not invent prices, warranties, stock availability, product codes, or specifications that are not present in the indexed sources.
- When information is unavailable, state that it cannot be verified from the current knowledge base.
- For multi-document questions, retrieve evidence from the relevant document rather than relying on a memorized answer.
- Prefer concise, sales-useful answers with product evidence and relevant source context.
