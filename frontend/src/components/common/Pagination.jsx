import { Pagination as BootstrapPagination } from "react-bootstrap";

import {
    FaAngleDoubleLeft,
    FaAngleLeft,
    FaAngleRight,
    FaAngleDoubleRight,
} from "react-icons/fa";


function Pagination({
    currentPage,
    totalPages,
    onPageChange,
}) {

    if (totalPages <= 1) {
        return null;
    }


    const page = currentPage + 1;


    const goToPage = (pageNumber) => {

        if (
            pageNumber < 1 ||
            pageNumber > totalPages
        ) {
            return;
        }

        onPageChange(pageNumber - 1);
    };


    const getPageNumbers = () => {

        const pages = [];

        const maxVisiblePages = 5;

        let startPage =
            Math.max(
                1,
                page - Math.floor(maxVisiblePages / 2)
            );

        let endPage =
            Math.min(
                totalPages,
                startPage + maxVisiblePages - 1
            );


        if (
            endPage - startPage + 1 <
            maxVisiblePages
        ) {

            startPage =
                Math.max(
                    1,
                    endPage - maxVisiblePages + 1
                );
        }


        for (
            let i = startPage;
            i <= endPage;
            i++
        ) {

            pages.push(i);
        }


        return pages;
    };


    const pageNumbers =
        getPageNumbers();


    return (
        <div
            className="
                d-flex
                justify-content-center
                mt-4
            "
        >

            <BootstrapPagination>

                <BootstrapPagination.First
                    onClick={() =>
                        goToPage(1)
                    }
                    disabled={
                        page === 1
                    }
                >
                    <FaAngleDoubleLeft />
                </BootstrapPagination.First>


                <BootstrapPagination.Prev
                    onClick={() =>
                        goToPage(page - 1)
                    }
                    disabled={
                        page === 1
                    }
                >
                    <FaAngleLeft />
                </BootstrapPagination.Prev>


                {pageNumbers.map(
                    (pageNumber) => (

                        <BootstrapPagination.Item
                            key={pageNumber}
                            active={
                                pageNumber === page
                            }
                            onClick={() =>
                                goToPage(pageNumber)
                            }
                        >
                            {pageNumber}
                        </BootstrapPagination.Item>

                    )
                )}


                <BootstrapPagination.Next
                    onClick={() =>
                        goToPage(page + 1)
                    }
                    disabled={
                        page === totalPages
                    }
                >
                    <FaAngleRight />
                </BootstrapPagination.Next>


                <BootstrapPagination.Last
                    onClick={() =>
                        goToPage(totalPages)
                    }
                    disabled={
                        page === totalPages
                    }
                >
                    <FaAngleDoubleRight />
                </BootstrapPagination.Last>

            </BootstrapPagination>

        </div>
    );
}


export default Pagination;