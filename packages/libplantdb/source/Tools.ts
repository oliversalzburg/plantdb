export const kindSummarize = (plantKind: string | string[] | undefined) => {
  if (plantKind === undefined) {
    return "<unknown kind>";
  }

  if (Array.isArray(plantKind)) {
    return `${plantKind.length} kinds`;
  }

  return plantKind;
};

export const kindFlatten = (plantKind: string | string[] | undefined) => {
  if (plantKind === undefined) {
    return "<unknown kind>";
  }

  if (Array.isArray(plantKind)) {
    return plantKind.join(", ");
  }

  return plantKind;
};
