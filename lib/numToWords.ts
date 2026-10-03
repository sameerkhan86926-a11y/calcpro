export function numberToIndianWords(num: number): string {
  if (isNaN(num) || !isFinite(num)) return "";
  if (num === 0) return "Zero Rupees";

  const isNegative = num < 0;
  num = Math.abs(num);

  const units = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen",
  ];
  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
  ];

  const convertTwoDigits = (n: number): string => {
    if (n < 20) return units[n];
    return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + units[n % 10] : "");
  };

  const convertThreeDigits = (n: number): string => {
    let str = "";
    if (Math.floor(n / 100) > 0) {
      str += units[Math.floor(n / 100)] + " Hundred ";
    }
    const rem = n % 100;
    if (rem > 0) {
      str += convertTwoDigits(rem);
    }
    return str.trim();
  };

  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);

  if (integerPart === 0 && decimalPart > 0) {
    return `${convertTwoDigits(decimalPart)} Paise Only`;
  }

  let crore = Math.floor(integerPart / 10000000);
  let rem = integerPart % 10000000;
  let lakh = Math.floor(rem / 100000);
  rem = rem % 100000;
  let thousand = Math.floor(rem / 1000);
  let hundreds = rem % 1000;

  let result = "";

  if (crore > 0) {
    result += (crore >= 100 ? convertThreeDigits(crore) : convertTwoDigits(crore)) + " Crore ";
  }
  if (lakh > 0) {
    result += convertTwoDigits(lakh) + " Lakh ";
  }
  if (thousand > 0) {
    result += convertTwoDigits(thousand) + " Thousand ";
  }
  if (hundreds > 0) {
    result += convertThreeDigits(hundreds) + " ";
  }

  result = result.trim() + " Rupees";

  if (decimalPart > 0) {
    result += ` and ${convertTwoDigits(decimalPart)} Paise`;
  }

  result += " Only";

  return (isNegative ? "Minus " : "") + result;
}
