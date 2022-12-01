import { manageSelections } from './selection';

describe('manageSelections', () => {
  describe('when there are no selections', () => {
    describe('and an item is selected', () => {
      it('adds it to selections', () => {
        const id = '1';
        const selections = manageSelections({
          id,
          checked: true,
          index: 0,
          selections: {},
          ids: ['1'],
          isShiftPressed: false,
        });
        expect(Object.keys(selections).length).toEqual(1);
        expect(selections[id]).toEqual({ checked: true, index: 0 });
      });
    });

    describe('and shift key is pressed', () => {
      describe('and an item is selected', () => {
        it('adds multiple selections', () => {
          const id = '4';
          const selections = manageSelections({
            id,
            checked: true,
            index: 3,
            selections: {},
            ids: ['1', '2', '3', '4'],
            isShiftPressed: true,
          });
          expect(Object.keys(selections).length).toEqual(4);
        });
      });
    });
  });

  describe('when there is one selection', () => {
    describe('and an item is deselected', () => {
      it('removes it from selections', () => {
        const id = '1';
        const selections = manageSelections({
          id,
          checked: false,
          index: 0,
          selections: {
            [id]: { checked: true, index: 0 },
          },
          ids: ['1'],
          isShiftPressed: false,
        });
        expect(Object.keys(selections).length).toEqual(0);
      });
    });
  });
});
