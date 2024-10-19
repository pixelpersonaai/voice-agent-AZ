# voice-agent-AZ


# AI Voice Agent Pipeline (Azure AI Speech)

This project implements an AI voice agent pipeline using **Azure AI Speech**.
The pipeline allows for voice interaction between users and an AI agent with
customizable settings such as dialog speed, agent functionality, and the initial
greeting.

The codebase is written in **Next.js**. The setup process and customization
options are detailed below.

---
![Screenshot of the chat interface](https://i.imgur.com/s0hoic4.png)

---

## Table of Contents

- [Installation](#installation)
- [Environmental Variables](#environmental-variables)
- [Customization](#customization)
- [Next Steps](#next-steps)
- [License](#license)

---

## Installation
**Clone the Repository**: 
```
git clone https://github.com/pixelpersonaai/voice-agent-AZ.git
cd voice-agent-az
code .
```
**Install Dependencies**
```
npm install 
```
**Setup the Development Server**
```
npm run dev
```

## Environmental Variables

OPEN_AI API KEY:
```
OPENAI_API_KEY=your-openai-api-key
```
AZURE TTS:
```
TTS_REGION=
TTS_KEY=
SPEECH_REGION=
SPEECH_KEY=
```

## Customization
1. **Startring Message**: 
    Change the initial greeting or starting message that the AI agent says to the user.
    Look for the ```startingMessage.ts``` file in the api route and modify its value.

2. **Agent Functionality**: 
    You can adjust the functionality of the voice agent in ```chat``` api, including how it processes input and responds. Custom agent logic can be added to the core AI processing functions.

3. **Input Submission Speed (Dialog Gap)**: 
    The speed at which the agent recognizes gaps in the user’s input can be tweaked.
    Adjust the time between dialog interactions (the waiting time for input) by modifying the ```timeSinceLastUpdate``` setting in useEffect().


## Next Steps
**Improving the Interruption Mechanism**: The current version of the pipeline can be further improved to handle interruptions more smoothly (i.e., the user speaking over the agent). Future updates should focus on enhancing this feature.

**AI Agent Workflow**: Agent(s) can be added to the chat API route to perform actions (such as use tools), use RAG to improve reponse accuracy, and make plans.

## License
This project is licensed under the Apache 2.0 License. See the LICENSE file for more details.

