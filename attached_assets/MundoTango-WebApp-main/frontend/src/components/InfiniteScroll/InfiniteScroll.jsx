import React from "react";
import InfiniteScroll from "react-infinite-scroll-component";

const CustomInfiniteScroll = ({
  children,
  LoadingScreen,
  getRecords,
  dataLength,
  hasMore,
  scrollableTarget,
  endMessage
}) => {
  return (
    <InfiniteScroll
      dataLength={dataLength || 0}
      next={getRecords}
      hasMore={hasMore}
      loader={LoadingScreen}
      style={{overflow:"hidden"}}
      scrollableTarget={scrollableTarget}
      endMessage={endMessage}
    >
      {children}
    </InfiniteScroll>
  );
};

export default CustomInfiniteScroll;
