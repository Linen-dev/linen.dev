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
