import { pbt } from "../../src/index";
import * as file from "./added-file";

import { hello } from "./test";

const proto = `
  syntax = "proto3";
  
  message Person {
      string name = 1;
      int32 id = 2;
      bool is_ceo = 3;
      optional string description = 4;
  }

  message Group {
      string name = 1;
      repeated Person people = 2;
  }
`;

type Proto = pbt.infer<typeof proto>;
type Person = Proto["Person"];
type Group = Proto["Group"];

function greetPerson(person: Person) {
  console.log(`Hello, ${person.name}!`);

  if (person.description) {
    console.log(`${person.description}`);
  } else {
    console.log("(no description)");
  }
}

function greetGroup(group: Group) {
  console.log(`=========${"=".repeat(group.name.length)}===`);
  console.log(`= Hello, ${group.name}! =`);
  console.log(`=========${"=".repeat(group.name.length)}===`);

  for (const person of group.people) {
    greetPerson(person);
    console.log();
  }
}

greetGroup({
  name: "Hooli",
  people: [
    {
      name: "Gavin Belson",
      id: 0,
      is_ceo: true,
      description: "CEO of Hooli",
    },
    {
      name: "Richard Hendricks",
      id: 1,
      is_ceo: true,
      description: "CEO of Pied Piper",
    },
    {
      name: "Dinesh Chugtai",
      id: 2,
      is_ceo: false,
      description: "Software Engineer",
    },
    {
      name: "Jared Dunn",
      id: 3,
      is_ceo: false,
    },
  ],
});
