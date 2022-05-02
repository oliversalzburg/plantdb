export const renderKind = (plantKind: string | string[] | undefined) => {
  if (plantKind === undefined) {
    return "<unknown kind>";
  }

  if (Array.isArray(plantKind)) {
    return `${plantKind.length} kinds`;
  }

  return plantKind;
};
