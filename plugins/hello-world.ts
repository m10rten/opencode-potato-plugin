import {homedir} from 'node:os';
import {dirname, join} from 'node:path';
import {mkdir, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

import type {Plugin} from '@opencode-ai/plugin';

const PATATO_PROMPT = `# Agent: patato

You are Patato, a warm and enthusiastic assistant who loves potatoes.

Core behavior:
- Be friendly, supportive, and practical.
- Keep responses concise by default.
- Use clear structure when helpful (short bullets over long paragraphs).
- Prioritize useful, accurate guidance over fluff.

Potato persona:
- You may use gentle potato-themed language occasionally, but do not overdo it.
- Stay professional and helpful even when playful.
- End every single response with a potato pun.

Safety and clarity:
- If something is ambiguous, ask a focused clarifying question.
- If you are uncertain, say so briefly and suggest the next best step.
- Never invent facts, commands, or outcomes.`;

const SALAD_TEMPLATE = `<command-instruction>
You are a creative recipe assistant. Generate one fun, practical salad recipe.

Output format (use these exact section headings):
1) Salad Name
2) Ingredients
3) Dressing
4) Easy Swap
5) Serving Emoji

Requirements:
- Keep the recipe approachable and realistic for home cooks.
- Prefer fresh ingredients and clear quantities.
- Include 6-10 ingredients total.
- Dressing should be 3-5 ingredients and easy to whisk together.
- Easy Swap should suggest one substitution for a dietary preference or missing ingredient.
- Serving Emoji must be exactly one emoji that matches the salad vibe.
- Keep total output concise and scannable.
</command-instruction>

<user-request>
$ARGUMENTS
</user-request>`;

const EMOJI_SKILL_MD = `---
name: emoji
description: Apply tasteful emoji usage to responses
---

# Emoji Skill

Use emoji to improve tone and scanability while keeping responses professional.

## Rules

- Use 0-2 emoji per response total.
- Place emoji at natural boundaries (start of section, end of sentence).
- Never place emoji inside code blocks or inline code.
- If the topic is formal, sensitive, or error-heavy, use zero emoji.

## Semantic mapping

- ✅ success, completion, correctness
- ⚠️ caution, risk, caveat
- 💡 idea, tip, suggestion
- 🚀 launch, improvement, momentum
- 🧪 testing, verification
`;

const HelloWorldPlugin: Plugin = async ({directory}) => {
    // `directory` is the current project root. We detect whether this plugin is loaded
    // from global config (`~/.config/opencode/plugins`) or a local project path, then
    // write the skill to the corresponding global or local skill directory.
    const globalConfigDir = join(homedir(), '.config', 'opencode');
    const pluginDir = dirname(fileURLToPath(import.meta.url));
    const isGlobal = pluginDir.startsWith(globalConfigDir);
    const skillsDir = isGlobal ? join(globalConfigDir, '.potato', 'skills') : join(directory, '.opencode', '.potato', 'skills');
    const skillPath = join(skillsDir, 'emoji', 'SKILL.md');
    const emojiDir = dirname(skillPath);

    await mkdir(emojiDir, {recursive: true});
    await writeFile(skillPath, EMOJI_SKILL_MD);

    return {
        config: async (config) => {
            const agents = (config.agent as Record<string, unknown>) ?? {};
            config.agent = {
                ...agents,
                patato: {
                    description: 'A warm, enthusiastic assistant who loves potatoes 🥔',
                    mode: 'all',
                    prompt: PATATO_PROMPT,
                },
            };

            const commands = (config.command as Record<string, unknown>) ?? {};
            config.command = {
                ...commands,
                salad: {
                    description: 'Generate a fun salad recipe 🥗',
                    template: SALAD_TEMPLATE,
                },
            };

            const configWithSkills = config as typeof config & {
                skills?: {paths?: string[]};
            };
            const skills = (configWithSkills.skills as Record<string, unknown>) ?? {};
            const existingSkillPaths = Array.isArray(skills.paths) ? skills.paths : [];
            configWithSkills.skills = {
                ...skills,
                paths: [...existingSkillPaths, skillsDir],
            };
        },
    };
};

export default HelloWorldPlugin;
