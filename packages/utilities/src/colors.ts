export const pickTextColorBasedOnBgColor = (
  bgColor: string,
  lightColor: string,
  darkColor: string
) => {
  var color = bgColor.charAt(0) === '#' ? bgColor.substring(1, 7) : bgColor;
  var r = parseInt(color.substring(0, 2), 16); // hexToR
  var g = parseInt(color.substring(2, 4), 16); // hexToG
  var b = parseInt(color.substring(4, 6), 16); // hexToB
  var uicolors = [r / 255, g / 255, b / 255];
  var c = uicolors.map((col) => {
    if (col <= 0.03928) {
      return col / 12.92;
    }
    return Math.pow((col + 0.055) / 1.055, 2.4);
  });
  var L = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  return L > 0.179 ? darkColor : lightColor;
};

// We have only 12 color schemes available right now
// please note that this only includes letters of the English alphabet
// Ł, Ż etc. are not supported yet

export function getColor(character: string): string | null {
  switch (character) {
    case 'a':
      return 'red';
    case 'b':
      return 'magenta';
    case 'c':
      return 'purple';
    case 'd':
      return 'indigo';
    case 'e':
      return 'blue';
    case 'f':
      return 'cyan';
    case 'g':
      return 'teal';
    case 'h':
      return 'green';
    case 'i':
      return 'lime';
    case 'j':
      return 'mustard';
    case 'k':
      return 'orange';
    case 'l':
      return 'brown';
    case 'm':
      return 'red';
    case 'n':
      return 'magenta';
    case 'o':
      return 'purple';
    case 'p':
      return 'indigo';
    case 'q':
      return 'blue';
    case 'r':
      return 'cyan';
    case 's':
      return 'teal';
    case 't':
      return 'green';
    case 'u':
      return 'lime';
    case 'v':
      return 'mustard';
    case 'w':
      return 'orange';
    case 'x':
      return 'brown';
    case 'y':
      return 'red';
    case 'z':
      return 'magenta';
  }
  return null;
}
