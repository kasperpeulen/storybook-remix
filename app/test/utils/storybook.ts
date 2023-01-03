import type { PlayFunctionContext } from "@storybook/csf";
import type { ReactRenderer } from "@storybook/react";
import type { ComponentProps } from "react";
import type { TestAppStory } from "~/test/TestApp";

export type PlayContext = PlayFunctionContext<ReactRenderer, ComponentProps<typeof TestAppStory>>;
