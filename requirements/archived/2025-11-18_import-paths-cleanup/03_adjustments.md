# Follow-up Adjustments

你没有改完。你需要把所有代码都过一遍，需要修改import的都调整一下。

我现在看到很多类似这样的报错
Cannot find module '~src/components/SvgIcon' or its corresponding type declarations.ts(2307)
- Fixed import paths by replacing "~src/" with "~/" alias in various components (SvgIcon, Button, Input, etc.) to align with tsconfig paths and resolve module not found errors.
