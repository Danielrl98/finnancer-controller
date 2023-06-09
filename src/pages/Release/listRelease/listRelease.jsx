import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { billsCollections, db } from "../../../components/firebase/config";
import { deleteDoc, doc, getDocs } from "firebase/firestore";
import {
  Container,
  TableWrapper,
  Table,
  Thead,
  Tbody,
  Td,
  Th,
  Tr,
  Menu,
  MenuGrid2,
  Button,
  Input,
  ButtonDelete,
} from "./style";
import { BsSearch } from "react-icons/bs";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { IoMdClose } from "react-icons/io";
import ReactPaginate from "react-paginate";
import './styled.sass'

export default function ListRelease() {
  
  const [release, setRelease] = useState([]);
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPageCount,setTotalPageCount] = useState(0)

  function handlePageClick({ selected: newPage }) {
    setCurrentPage(newPage);
  }

  let pageCount = 10; // número total de páginas
  const itemsPerPage = 2; // número de itens por página
  

  const getBills = async () => {
    await getDocs(billsCollections)
      .then((response) => response)
      .then((data) => {
        let response = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));

        let reg = new RegExp(filter, "gi");

        console.log(response);

        const filterobj = response.filter((r) => {
          if (r.client.match(reg) && response.length !== 0) {
            return r.client;
          }
        });
        setTotalPageCount(Math.ceil(filterobj.length / itemsPerPage));

        setRelease(filterobj);
      });
  };

  useEffect(() => {
    getBills();
  }, []);

  const handleDeleteDocs = async (id) => {
    if (confirm("Deseja excluir lançamento?")) {
      const data = doc(db, "bills", id);

      await deleteDoc(data).then(() => {
        getBills();
      });
    }
  };

  const styledReactPaginate = {
      display:'flex',
      flexDirection:'row'
  }
  return (
    <React.Fragment>
      <Container>
        <Menu>
          <div>
            <Link to="/release/create">
              <Button>
                {" "}
                <AiOutlinePlusCircle /> Criar Lançamento
              </Button>
            </Link>
          </div>
          <MenuGrid2>
            <Input
              type="text"
              placeholder="Pesquisar"
              onChange={(e) => setFilter(e.target.value)}
            />
            <Button onClick={getBills}>
              <BsSearch />
            </Button>
          </MenuGrid2>
        </Menu>
        <TableWrapper>
          <Table>
            <Thead>
              <tr>
                <Th style={{ width: "20%" }}>Cliente</Th>
                <Th style={{ width: "10%" }}>Valor</Th>
                <Th style={{ width: "15%" }}>Data de lançamento</Th>
                <Th style={{ width: "15%" }}>Data de vencimento</Th>
                <Th style={{ width: "15%" }}>Plano de contas</Th>
                <Th style={{ width: "15%" }}>Quitado</Th>
                <Th style={{ width: "5%" }}></Th>
                <Th style={{ width: "5%" }}></Th>
              </tr>
            </Thead>
            <Tbody>
              {release
                .slice(
                  currentPage * itemsPerPage,
                  (currentPage + 1) * itemsPerPage
                )
                .map((releases, i) => {
                  return (
                    <Tr key={i}>
                      <Td style={{ width: "20%" }}>{releases.client}</Td>
                      <Td>
                        R${" "}
                        {parseFloat(releases.value)
                          .toFixed(2)
                          .replace(".", ",")}
                      </Td>
                      <Td>
                        {new Date(releases.releaseDate).toLocaleDateString(
                          "pt-BR"
                        )}
                      </Td>
                      <Td>
                        {new Date(releases.dueDate).toLocaleDateString("pt-BR")}
                      </Td>
                      <Td>{releases.plan}</Td>
                      <Td>{releases.itsPaid ? "Pago" : "Não pago"}</Td>
                      <Td>
                        <Link to={"/release/edit?" + releases.id}>
                          <Button>Editar</Button>
                        </Link>
                      </Td>
                      <Td>
                        <ButtonDelete
                          onClick={() => handleDeleteDocs(releases.id)}
                        >
                          <IoMdClose />
                        </ButtonDelete>
                      </Td>
                    </Tr>
                  );
                })}
            </Tbody>
          </Table>
          <ReactPaginate
            className="react-paginate-class"
            pageCount={totalPageCount}
            pageRangeDisplayed={3}
            marginPagesDisplayed={2}
            onPageChange={handlePageClick}
            containerClassName={"pagination"}
            activeClassName={"active"}
            previousLabel="<"
            nextLabel=">"
            
          />
        </TableWrapper>
      </Container>
    </React.Fragment>
  );
}
