export const formatPrice = (value: string) => {
  const numericValue = value.replace(/[^0-9]/g, "");
  const formattedPrice = new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
    minimumFractionDigits: 2,
  }).format(parseFloat(numericValue));
  const precoFormatado = formattedPrice.replace(/\s(?=Kz)/g, "x").replace(/\s/g, ".").replace(/x/g, " ");

  return precoFormatado;
};