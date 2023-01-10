import type { Prisma } from "@prisma/client";

export function getJokes(): Prisma.JokeUncheckedCreateInput[] {
  // shout-out to https://icanhazdadjoke.com/
  return [
    {
      name: "Road worker",
      content: `I never wanted to believe that my Dad was stealing from his job as a road worker. But when I got home, all the signs were there.`,
    },
    {
      name: "Frisbee",
      content: `I was wondering why the frisbee was getting bigger, then it hit me.`,
      jokesterId: "39cffd21-7933-56e4-9d9c-1afeda9d5906",
    },
    {
      name: "Trees",
      content: `Why do trees seem suspicious on sunny days? Dunno, they're just a bit shady.`,
    },
    {
      name: "Skeletons",
      content: `Why don't skeletons ride roller coasters? They don't have the stomach for it.`,
    },
    {
      name: "Hippos",
      content: `Why don't you find hippopotamuses hiding in trees? They're really good at it.`,
    },
    {
      name: "Dinner",
      content: `What did one plate say to the other plate? Dinner is on me!`,
    },
    {
      name: "Elevator",
      content: `My first time using an elevator was an uplifting experience. The second time let me down.`,
    },
  ].map((joke) => {
    return { ...joke, jokesterId: joke.jokesterId ? joke.jokesterId : "7efda802-d7d1-5d76-97d6-cc16a9f3e357" };
  });
}
