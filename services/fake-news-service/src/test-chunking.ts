import { chunkText } from "./rag/chunking.service.js";

const text = `
Employees are entitled to 12 casual leaves annually.
Unused casual leaves cannot be carried forward.
Employees are eligible for 10 sick leaves annually.
A medical certificate is required for sick leave exceeding three days.
Employees must submit leave applications through the HR portal.
Managers must approve leave requests before employees take leave.
All employees must follow the company's attendance policies.
`

const chunks = chunkText(text, 150, 30);

console.log("Original text length:", text.length);
console.log("Total chunks:", chunks.length);

chunks.forEach((chunk, index) => {
    console.log(`\n========== CHUNK ${index + 1} ==========`);
    console.log("Length:", chunk.length);
    console.log("Content:", chunk);
});