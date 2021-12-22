import React, { useEffect, useState } from 'react';
import { Pagination } from 'react-bootstrap';

interface Props {
  /**
   * Number of currently active page.
   */
  currentPage: number;
  /**
   * Number of items per page.
   */
  pageSize: number;
  /**
   * Number of items in total.
   */
  totalCount: number;
  /**
   * Callback when page changes. Returns current page and
   * page size with calculated limit and offset values.
   */
  onPageChange: (page: {
    page: number,
    pageSize: number,
    limit: number,
    offset: number,
  }) => void;
}

const AppPagination: React.FC<Props> = ({
  currentPage, pageSize, totalCount, onPageChange,
}) => {
  const items: JSX.Element[] = [];
  const [pageCount, setPageCount] = useState(0);
  const [detailsText, setDetailsText] = useState('');

  // Watch for total count or page size change
  useEffect(() => {
    setPageCount(Math.ceil(totalCount / pageSize));
  }, [totalCount, pageSize]);

  // Watch for page or page size change
  useEffect(() => {
    let details = '';

    if (totalCount >= pageSize) {
      // Recalculate page starting and ending point when page changes
      // Make sure to only show values between 0 and totalCount
      const start = Math.max((currentPage - 1) * pageSize, 0);
      const end = Math.min((currentPage * pageSize), totalCount);
      details = `${start} - ${end} / ${totalCount}`;
    }

    setDetailsText(details);
  }, [currentPage, pageSize, totalCount]);

  const pageChanged = (page: number) => {
    onPageChange({
      page,
      pageSize,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });
  };

  const prevPage = () => pageChanged(currentPage - 1);
  const nextPage = () => pageChanged(currentPage + 1);

  // If there are only one or less pages don't render anything
  if (pageCount <= 1) {
    return null;
  }

  // Create pagination items
  for (let i = 1; i <= pageCount; i++) {
    items.push(
      <Pagination.Item key={i} active={i === currentPage} onClick={() => pageChanged(i)}>
        {i}
      </Pagination.Item>,
    );
  }

  return (
    <div className="d-flex justify-content-between align-items-center">
      <Pagination className="mb-0">
        <Pagination.Prev disabled={currentPage === 1} onClick={prevPage} />
        {items}
        <Pagination.Next disabled={currentPage === pageCount} onClick={nextPage} />
      </Pagination>
      <p className="pagination-details">{detailsText}</p>
    </div>
  );
};

export default AppPagination;
