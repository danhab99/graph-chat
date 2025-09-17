"use client";

import { createStateContext } from "react-use";

const [useSelectedModel, SelectedModelProvider] = createStateContext("");

export { useSelectedModel, SelectedModelProvider };
