# opencode-potato-plugin

How to share agents, command and skills using just a plugin for OpenCode.

> See full plugin example: [plugins/hello-world.ts](https://github.com/m10rten/opencode-potato-plugin/blob/main/plugins/hello-world.ts)

## The Power of Plugin Architecture: Sharing Intelligence in AI Workflows

Sharing agents, commands, and skills through plugins is a powerful architectural pattern that transforms how complex AI workflows are built and deployed. It shifts the paradigm from monolithic setups to a modular, reusable ecosystem.

### The "Why": Why Share?

The primary value of plugin architecture is reusability and consistency. Instead of redefining agent behaviors or command structures repeatedly, developers can package complex, well-tested logic into a single, installable unit.
*   DRY Principle: You define the core logic once, ensuring consistency across your entire application.
*   Easy Sharing: Plugins allow you to share configurations, agent definitions, and specialized skills across different projects or environments simply by installing them.
*   Maintainability: Updates to a shared skill or command only need to be made in one place, instantly propagating the change everywhere it is used.

### The "How": Mechanism Overview

The mechanism centers around a plugin that hooks into the system's configuration and file structure to dynamically inject new capabilities. It bridges the gap between static code and dynamic configuration.

The trick is to alter the opencode configuration directly:
```ts
const HelloWorldPlugin: Plugin = async ({directory}) => {
    return {
        config: async (config) => {
          // ...
        }
    }
}
export default HelloWorldPlugin;
```

1.  Plugin Entry Point: The plugin starts by defining an asynchronous function that receives context, like the current project root directory.
2.  Contextual Path Resolution: The plugin must intelligently determine where to store its assets. It checks if it is running in a global context (e.g., ~/.config/opencode/plugins) or a local project context.
3.  Dynamic Injection via File System: Based on the contextual determination, the plugin uses file system operations (mkdir, writeFile) to place its specialized components. This ensures that context-specific skills are isolated but discoverable:
    ```ts
    await mkdir(emojiDir, {recursive: true}); // eg/emoji/
    await writeFile(skillPath, EMOJI_SKILL_MD); // eg/emoji/SKILL.md
    ```
4.  Configuration Overrides: The plugin then injects its custom definitions into the primary configuration structure. This involves merging user-defined or default values with the plugin's specific definitions for agents, commands, and skills. For instance, it updates the agent configuration to include a specific prompt and mode:
    ```ts
    config.agent = {
        ...agents, // get all agents from config.agent first.
        patato: {
            description: 'A warm, enthusiastic assistant who loves potatoes 🥔',
            mode: 'all',
            prompt: PATATO_PROMPT, // Injecting the custom prompt
        },
    };
    ```
    Same goes for commands:
    ```ts
    config.command = {
        ...commands, // get all commands from config.command first.
        salad: {
            description: 'Generate a fun salad recipe 🥗',
            template: SALAD_TEMPLATE,
        },
    };
    ```
    
This approach creates a highly flexible system. By separating the definition of intelligence (skills) from the logic of the application (agents/commands), you enable seamless, localized, and highly reusable functionality across any project.
