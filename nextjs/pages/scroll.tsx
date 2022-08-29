import React, { useState } from 'react';
import ViewportList from 'react-viewport-list';
import { Waypoint } from 'react-waypoint';

const Layout = ({ children }: { children: JSX.Element }) => {
  return (
    <div>
      <div
        style={{
          height: '80px',
          backgroundColor: 'blue',
          position: 'static',
        }}
      >
        navbar / header
      </div>
      <div
        style={{
          display: 'flex',
        }}
      >
        <div
          style={{
            width: '250px',
            height: 'calc(100vh - 80px)',
            backgroundColor: 'blueviolet',
            overflowY: 'auto',
          }}
        >
          {Array(50)
            .fill(null)
            .map((e) => (
              <p key={e}>left menu</p>
            ))}
        </div>
        <div
          style={{
            width: '100vw',
            height: 'calc(100vh - 80px)',
            backgroundColor: 'gray',
          }}
        >
          {children}
        </div>
        <div
          style={{
            width: '250px',
            height: 'calc(100vh - 80px)',
            backgroundColor: 'cornflowerblue',
            overflowY: 'auto',
          }}
        >
          {Array(50)
            .fill(null)
            .map((e) => (
              <p key={e}>right content</p>
            ))}
        </div>
      </div>
    </div>
  );
};

const MessageRender = ({ index, item }: { index: number; item: itemType }) => {
  return (
    <div
      key={index}
      style={{
        flex: '0 0 auto',
        padding: '1rem',
        borderRadius: '1rem',
        backgroundColor: 'rgb(44, 44, 46)',
        overflow: 'hidden',
        maxWidth: '75%',
        minHeight: '42px',
        marginBottom: '16px',
      }}
    >
      {item.title}
    </div>
  );
};

const WaypointRender = ({
  index,
  item,
  onWaypointVisible,
}: {
  index: number;
  item: itemType;
  onWaypointVisible: Function;
}) => {
  return (
    <Waypoint
      key={index}
      onEnter={() => onWaypointVisible(item)}
      topOffset="-40%"
      bottomOffset="-40%"
    >
      <div>
        page {item.direction} {item.cursor}
      </div>
    </Waypoint>
  );
};

const itemBuilder = (n: number) =>
  new Array(n).fill(null).map(() => ({
    title: `message ` + n,
  }));

const random = () => Math.random().toString();

const App = () => {
  const [items, setItems] = useState([
    { type: 'waypoint', cursor: random(), direction: 'prev' },
    ...itemBuilder(10),
    { type: 'waypoint', cursor: random(), direction: 'next' },
  ]);

  const [cursorUsed, setCursorUsed] = useState<Record<string, boolean>>({});

  const onWaypointVisible = (item: itemType) => {
    if (item.direction === 'prev' && item.cursor && !cursorUsed[item.cursor]) {
      setCursorUsed({ ...cursorUsed, [item.cursor]: true });
      setItems((items) => {
        return [
          { type: 'waypoint', cursor: random(), direction: 'prev' },
          ...itemBuilder(10),
          ...items,
        ];
      });
    }
  };

  function itemRender(item: itemType, index: number): JSX.Element {
    return item.type === 'waypoint' ? (
      <WaypointRender
        index={index}
        item={item}
        onWaypointVisible={onWaypointVisible}
        key={index}
      />
    ) : (
      <MessageRender index={index} item={item} key={index} />
    );
  }

  return <ScrollingList items={items} itemRender={itemRender}></ScrollingList>;
};

type itemType = {
  type?: string;
  title?: string;
  direction?: string;
  cursor?: string;
};

type ScrollingListProps = {
  items: itemType[];
  itemRender: Function;
};
type ScrollingListState = {
  listRef: any;
  lastScrollDistanceToBottomRef: any;
  lastScrollDistanceToTopRef: any;
};

class ScrollingList extends React.Component<
  ScrollingListProps,
  ScrollingListState
> {
  constructor(props: ScrollingListProps) {
    super(props);
    this.state = {
      listRef: React.createRef(),
      lastScrollDistanceToBottomRef: React.createRef(),
      lastScrollDistanceToTopRef: React.createRef(),
    };
  }

  //   scrollableRoot.scrollTop =
  //           scrollableRoot.scrollHeight - lastScrollDistanceToBottom

  getSnapshotBeforeUpdate(
    prevProps: ScrollingListProps,
    prevState: ScrollingListState
  ) {
    // Are we adding new items to the list?
    // Capture the scroll position so we can adjust scroll later.
    if (prevProps.items.length < this.props.items.length) {
      const list = this.state.listRef.current;
      return list.scrollHeight - list.scrollTop;
    }
    return null;
  }

  componentDidUpdate(
    prevProps: ScrollingListProps,
    prevState: ScrollingListState,
    snapshot: any
  ) {
    // If we have a snapshot value, we've just added new items.
    // Adjust scroll so these new items don't push the old ones out of view.
    // (snapshot here is the value returned from getSnapshotBeforeUpdate)
    if (snapshot !== null) {
      const list = this.state.listRef.current;
      list.scrollTop = list.scrollHeight - snapshot;
    }
  }

  render() {
    return (
      <div
        style={{
          height: '100%',
          width: '100%',
          padding: '0 1rem',
          display: 'flex',
          flexDirection: 'column',
          overflowX: 'hidden',
          overflowY: 'auto',
          willChange: 'transform',
        }}
        ref={this.state.listRef}
      >
        <ViewportList
          viewportRef={this.state.listRef}
          items={this.props.items}
          itemMinSize={200}
          margin={16}
          initialIndex={this.props.items?.length - 1}
          initialAlignToTop={{ block: 'end', inline: 'end' }}
          overscan={4}
        >
          {(item, index) => this.props.itemRender(item, index)}
        </ViewportList>
      </div>
    );
  }
}

export default function LayoutWrapper() {
  return (
    <Layout>
      <App />
    </Layout>
  );
}
