---
title: 为什么 OpenAI 也开始让 ChatGPT 做梦
date: 2026-06-06T00:00:00.000Z
description: Hermes 的持久记忆和 OpenClaw 的 Dreaming，正在指向大厂 AI 助手绕不开的同一个基础设施问题
authors:
  - eave
tags:
  - ai
  - openclaw
---

> Hermes 的持久记忆和 OpenClaw 的 Dreaming，正在指向大厂 AI 助手绕不开的同一个基础设施问题。

## 这次重点不是“OpenAI 也用了一个好听的词”

OpenAI 最近在官博发了一篇文章，标题就叫 **Dreaming: Better memory for a more helpful ChatGPT**。

如果只看标题，很容易把它当成一次产品包装：把“记忆更新”说成“做梦”，听起来更有想象力，也更适合传播。但我觉得这件事真正值得看的是另一层：

为什么到了 2026 年，OpenAI 这样的公司也不得不认真做 dreaming 这种记忆系统？

因为在很长一段时间里，大厂 AI 产品对“记忆”其实是谨慎甚至保守的。最常见的做法，是把记忆做成几条显式保存的用户偏好，或者把历史对话当作检索材料，需要时再捞一点出来。它们不太会让一个后台系统持续地整理你、压缩你、更新你。

这很合理。大厂要面对隐私、误记、安全、解释权、地区合规、海量用户成本。一个开源 agent 可以大胆一点：先让用户在本机跑起来，先把 MEMORY.md 写出来，先让 agent 自己试着维护上下文。大厂不行，大厂一旦记错了，或者把不该提的东西提出来，就是产品事故。

所以这次 OpenAI 开始公开讲 dreaming，我不觉得它只是追一个概念。更像是一个信号：当 AI 助手从“聊天框”走向“长期 agent”，记忆系统已经不能继续停留在小本子阶段了。

![科幻可爱的 agent 正在记忆舱里做梦](https://assets.eaveluo.com/blog/2026/06/night-memory-map.png)

## 开源 agent 先踩到了这个问题

Hermes 和 OpenClaw 很早就把这个问题摆到了台面上。

但这里要先把概念边界说清楚：**Hermes 没有把自己的内置记忆系统命名为 Dreaming**。它做的是 persistent memory、session search、episodic memory，以及可选的外部记忆提供方。OpenClaw 才是明确把后台记忆巩固过程叫做 Dreaming，并且设计了 Light、Deep、REM 这类阶段。

所以更准确的说法不是“Hermes 和 OpenClaw 都先做了 dreaming”，而是：Hermes 先把“agent 需要长期可维护上下文”做成核心能力；OpenClaw 在这个方向上进一步把“记忆维护”产品化为 Dreaming；OpenAI 现在用 Dreaming V3 把类似问题带到了大众级 ChatGPT。

Hermes 的思路更偏“持久上下文”：它有 `MEMORY.md`、`USER.md` 这样的稳定记忆文件，也有跨会话搜索和 episodic memory。它要解决的是一个很实际的问题：agent 如果每天都像第一次见你，那就永远只能是临时工具。它必须知道你的项目、环境、偏好、踩过的坑，才能越用越顺手。

OpenClaw 的 Dreaming 则更进一步，把“记忆维护”做成一个后台巩固过程。它不是简单地把所有历史塞进上下文，而是让短期信号经过 Light、Deep、REM 三个阶段：先整理近期材料，再给候选记忆打分，最后把真正值得沉淀的东西写入 `MEMORY.md`。Dream Diary 还把这个过程用人能读懂的方式展示出来。

这两条实践线有个共同点：它们都承认 agent 不是一次性对话模型，而是一个会长期运行、会反复遇到同一个人、同一个项目、同一批偏好的系统。

这个判断在开源世界里更早发生，不是偶然。

开源 agent 的用户常常就是开发者自己。开发者最受不了的就是重复说明：“这个项目用 pnpm，不要 npm install”“这个测试要先启动本地服务”“上次你试过方案 A，失败了”。这些东西如果每次都要重讲，agent 的智能感会立刻塌掉。

于是 Hermes 和 OpenClaw 这类工具先把记忆当成了核心工程问题，而不是锦上添花的 personalization。

## 为什么大厂以前不太这么干

大厂 AI 工具当然也知道记忆重要，但它们以前不太敢把记忆做成 dreaming 这种形态，我觉得有几个原因。

第一，**记忆是高风险的个性化**。

推荐系统记错你喜欢什么，大不了给你推错内容。AI 助手记错你是谁，就会在对话里一本正经地把错误当背景。它可能把旧计划当新计划，把临时偏好当长期偏好，把一句玩笑当成稳定事实。越拟人化，越容易冒犯人。

第二，**记忆不是越多越好**。

很多产品团队一开始会以为“长上下文”能解决一切。窗口变大，把历史塞进去，不就行了吗？但真正长期使用后会发现，原始历史太吵了。人不是需要 AI 记住所有对话，而是需要它知道哪些东西仍然重要，哪些东西已经过期，哪些东西只是当时随口一说。

第三，**记忆需要维护，不只是存储**。

数据库可以保存事实，但 agent 需要的是“可执行的上下文”。同一句话，今天可能是计划，明天可能是回忆，下个月可能已经完全无关。OpenAI 在官博里举了类似的例子：你说七月要去新加坡，旅行结束后，系统应该把它更新成“你去过新加坡”，而不是继续当作未来计划。

第四，**解释权很难做**。

当 AI 用了某条记忆，它最好能告诉你为什么用了、从哪里来、怎么改、怎么删。OpenAI 的 Memory FAQ 里也强调了 memory summary 和 memory sources，但同时说明 summary 不一定包含所有被系统使用的上下文。这里的产品难度很高：既要足够透明，又不可能把所有内部合成都摊成流水账。

第五，**规模太贵**。

开源 agent 可以在一台机器上慢慢整理记忆，大厂要面对的是数亿用户和多年历史。OpenAI 这次特别提到，新的 dreaming 架构把面向免费用户提供 dreaming 所需的计算量降到了大约五分之一。也就是说，不是之前没人想到，而是之前很难把质量、成本、延迟、隐私和控制面一起压住。

## OpenAI 为什么现在必须做

我觉得答案藏在 OpenAI 自己的三个评价目标里：carry forward useful context、follow preferences and constraints、stay current over time。

翻译成人话就是：

+ 用户不想每次重新介绍自己
+ 用户希望 AI 真的遵守长期偏好
+ 用户不希望 AI 抱着过期信息不放

这三个目标听起来普通，但它们决定了 ChatGPT 能不能从聊天工具变成长期助手。

一个聊天工具可以没有记忆。你问天气，它答天气；你问代码，它写代码。上下文断了也没关系，因为任务本来就是一次性的。

但一个 agent 不行。

agent 要替你规划、提醒、研究、执行。它必须知道你是谁，也必须知道“你是谁”这件事会变化。一个不会更新记忆的 agent，会越来越像一间没整理过的房间：东西都在，但找不到；旧纸条还贴在墙上，新偏好被压在桌角。

所以 OpenAI 开始采用 dreaming，本质上不是为了让 ChatGPT 更像人，而是为了让它更像一个长期可用的系统。

这也是为什么 Pulse 和 Dreaming 会在同一条产品线上出现。Pulse 每天早上给你一组个性化更新，看上去是主动研究功能，但它背后需要稳定的记忆底座：它得知道你最近关心什么、哪些事情已经结束、哪些反馈应该影响明天的卡片。

没有 dreaming，Pulse 很容易变成“猜你喜欢”的 AI 版；有了 dreaming，它才有机会变成“我知道你最近真正需要什么”的助手。

![开源小 agent 把记忆晶体送进大平台](https://assets.eaveluo.com/blog/2026/06/morning-pulse-cards.png)

## Dreaming 解决的是“记忆熵增”

我现在更愿意把 dreaming 理解成一种抗熵机制。

长期 agent 的记忆一定会熵增。你每天和它说话，产生偏好、计划、临时任务、项目细节、纠错、失败尝试、情绪上下文。所有东西混在一起，过一段时间就会变脏。

最粗暴的办法是全部保留，然后靠检索。问题是检索会把“相关”误当“重要”。你上个月提过一次的东西，可能关键词很相关，但已经不该影响今天的判断。

另一种办法是只保留用户显式要求记住的东西。问题是用户不会像维护数据库一样维护自己。很多真正重要的偏好，都是在日常对话里自然暴露出来的，不会以“请记住”开头。

Dreaming 想走第三条路：让系统周期性地合成、压缩、更新、遗忘。

这和人类睡觉的比喻之所以成立，不是因为 AI 有梦境画面，而是因为它也需要一个“不对外回答问题”的时间段。这个时间段里，它不急着响应用户，而是处理自己的内部状态。

从这个角度看，Dreaming 不只是记忆功能，而是 agent 生命周期的一部分。

白天对话，夜里整理；即时响应之外，还有后台巩固；用户看到的是回答，系统维护的是连续性。

## 但这也会带来新的产品伦理

我不想把这件事写成纯乐观。

记忆越强，越需要边界。尤其是当记忆来自聊天、文件、连接应用、Gmail、日历这些源头时，用户需要知道系统到底在用什么。

OpenAI 现在做了 memory summary、memory sources、“不要再提这个”、临时聊天、关闭 memory 等控制。但这些控制仍然不是完美的。Help Center 里写得很清楚：memory summary 是高层摘要，不保证展示所有上下文；“不要再提这个”可以减少未来引用，但不等于删除底层信息；要完整删除，可能需要处理过去聊天、文件、连接应用等多个来源。

这就是从开源 agent 的可检查记忆，走向大众产品里的 dreaming 时必须面对的难点。

在 Hermes、OpenClaw 这类开源工具里，用户往往就是系统操作者。你可以打开文件看 `MEMORY.md`，可以删，可以改，可以接受一点粗糙。可在 ChatGPT 这种大众产品里，用户不一定懂“合成记忆”是什么，也不一定愿意管理复杂的来源图。

所以 OpenAI 要做的不是简单复刻开源 agent 的做法，而是把它产品化：让普通用户感觉它“更懂我”，但又不能让用户觉得它“偷偷记我”。

这条线很细。

## 写在最后

我现在回头看 Hermes、OpenClaw 和 ChatGPT 的这条线，感觉挺清楚了。

Hermes 先证明了一件事：agent 需要长期、稳定、可压缩的个人上下文。

OpenClaw 又证明了一件事：长期记忆不能只靠堆文件，它需要后台巩固、评分、反思和可审阅的过程。

OpenAI 现在做 Dreaming V3，则说明这套逻辑已经不只是开源玩家的实验，而是大众 AI 助手迟早要走到的基础设施。

以前大家比的是模型能不能答得聪明。接下来可能要比的是：它能不能在时间里保持一个干净、更新、可控的你。

这件事比“AI 会不会做梦”更重要。

因为真正的梦不是那张可爱的图，也不是一个产品名。

真正的梦，是一个 agent 在你离开之后，还能认真整理与你有关的世界；等你回来时，它没有把所有旧东西都抱在怀里，也没有把重要的东西弄丢。

这才是 dreaming 作为记忆系统最有价值的地方。

---

**延伸阅读**

+ [OpenAI: Dreaming: Better memory for a more helpful ChatGPT](https://openai.com/index/chatgpt-memory-dreaming/)
+ [OpenAI: Introducing ChatGPT Pulse](https://openai.com/index/introducing-chatgpt-pulse/)
+ [OpenAI Help Center: Memory FAQ](https://help.openai.com/en/articles/8590148-memory-faq)
+ [OpenClaw Docs: Dreaming](https://docs.openclaw.ai/concepts/dreaming)
+ [Hermes Agent Docs: Persistent Memory](https://hermes-agent.ai/features/persistent-memory)
+ [NousResearch Hermes Agent memory docs](https://github.com/NousResearch/hermes-agent/blob/main/website/docs/user-guide/features/memory.md)
