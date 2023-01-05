import { Loader, Parameters } from "@storybook/react";
import { LinkDescriptor } from "@remix-run/node";
import { links } from "~/root";
import { links as indexLinks } from "~/routes";
import { links as jokesLinks } from "~/routes/jokes";
import { links as loginLinks } from "~/routes/login";

export const parameters: Parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  docs: {
    autoplay: true,
  },
};

export const loaders: Loader[] = [
  () => linksLoader(links()),
  () =>
    linksLoader(
      [...indexLinks(), ...jokesLinks(), ...loginLinks()].flatMap((link) =>
        !("rel" in link && link.rel === "stylesheet") ? [] : [{ href: link.href ?? "", rel: "preload", as: "style" }]
      )
    ),
];

export async function linksLoader(links: LinkDescriptor[]) {
  const loadedLinks: LinkDescriptor[] = [];

  const head = document.head;
  links.forEach((link) => {
    const element = document.createElement("link");
    // @ts-ignore
    for (const [key, value] of Object.entries(link)) element[key] = value;
    element.onload = () => loadedLinks.push(link);
    head.appendChild(element);
  });
  await waitFor(() => loadedLinks.length === links.length);
  return {};
}

export default function waitFor(condition: () => boolean, times = 100): Promise<null> {
  if (!condition() && times > 0) {
    return new Promise(requestAnimationFrame).then(() => waitFor(condition, --times));
  } else {
    return Promise.resolve(null);
  }
}
