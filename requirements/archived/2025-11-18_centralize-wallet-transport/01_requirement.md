这个项目很关键的一些代码是用于实现在我的插件里去连接其它的插件钱包。你看一下现在的实现方式，需要在几个不同的地方都运行代码来实现整个过程。

这个过程我希望它的名字叫`wallet-transport`

我希望这个过程相关的代码都在一个文件夹下。现在这些文件分散在不同地方。

context相关的文件，和signer，我希望保留目前的位置（它们只需要引用相关的代码）

记得考虑injected/inpage.ts和contents/metamask-bridge.ts，如果这两个也可以移动位置最好。可以修改文件名，用于表示这个文件是在extension的哪个环境下运行的。

文件名不要包含metamask，因为我之后还要支持其它类型的钱包。

这个新的文件夹，我希望在`src/wallet-transport`下。

之前引用 transport.ts 改为直接引用 wallet-transport (改为wallet-transport/index.ts)

尽量保持原有代码不变，只移动代码文件和重命名。

另外，我需要有一个单独的文档文件来描述这个流程是如何实现的。