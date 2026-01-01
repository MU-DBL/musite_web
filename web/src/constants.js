
//'Zinc', 'Copper', 'Ferrous', 'Ferric'
export const IonEnum = {
    ZINC: "Zinc",
    COPPER: "Copper",
    FERROUS: "Ferrous"
  };

export const ionOptions = [IonEnum.ZINC, IonEnum.COPPER, IonEnum.FERROUS];
export const ionUrl = document.location.protocol + "//" + document.location.hostname + ":5004/ionpred_api";
