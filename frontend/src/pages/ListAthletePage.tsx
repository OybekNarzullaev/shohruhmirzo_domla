import { PageContainer } from "@/layouts/PageContainer";
import Box from "@mui/material/Box";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { DataGrid, type GridRowsProp, type GridColDef } from "@mui/x-data-grid";
import IconButton from "@mui/material/IconButton";
import { useRef, useState, useLayoutEffect } from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import {
  CreateAthleteModal,
  useCreateAthleteModalStore,
} from "@/components/CreateAthleteModal";
import { Link } from "react-router";
import Tooltip from "@mui/material/Tooltip";

const rows: GridRowsProp = [
  {
    id: 1,
    name: "Oybek Narzullaev",
    age: 23,
    sport_type: "Boks",
    analysis_time: "2025-10-08 09:00",
  },
  {
    id: 2,
    name: "Jasur Tursunov",
    age: 19,
    sport_type: "Yugurish",
    analysis_time: "2025-10-07 15:30",
  },
  {
    id: 3,
    name: "Dilshod Karimov",
    age: 28,
    sport_type: "Suzish",
    analysis_time: "2025-10-06 12:00",
  },
  {
    id: 4,
    name: "Malika Ahmedova",
    age: 22,
    sport_type: "Gimnastika",
    analysis_time: "2025-10-05 10:00",
  },
];

// 📏 Container o‘lchamini avtomatik kuzatish uchun hook
function useContainerWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, width };
}

const ListAthletePage = () => {
  const { ref, width } = useContainerWidth();
  const { open } = useCreateAthleteModalStore();

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "name", headerName: "F.I.Sh", flex: 1, minWidth: 180 },
    { field: "age", headerName: "Yoshi", flex: 0.5, minWidth: 100 },
    { field: "sport_type", headerName: "Sport turi", flex: 1, minWidth: 150 },
    {
      field: "analysis_time",
      headerName: "Tahlil vaqti",
      flex: 1,
      minWidth: 180,
    },
    {
      field: "actions",
      headerName: "",
      width: 160,
      sortable: false,
      renderCell: (cell) => {
        return (
          <>
            <Link to={`/athlete/view/${cell.row.id}`}>
              <Tooltip title="Batafsil" placement="left">
                <IconButton color="primary">
                  <VisibilityIcon />
                </IconButton>
              </Tooltip>
            </Link>
            <Tooltip title="Tahrirlash" placement="left">
              <IconButton onClick={open} color="warning">
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="O'chirish" placement="left">
              <IconButton color="error">
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </>
        );
      },
    },
  ];
  return (
    <PageContainer
      title="Sportchilar"
      breadcrumbs={[{ title: "Asosiy", path: "/" }, { title: "Sportchilar" }]}
    >
      <CreateAthleteModal />
      <Stack sx={{ height: "100%", width: "100%", overflow: "hidden" }}>
        <Stack flexDirection={"row"} justifyContent={"end"} mb={2}>
          <Button
            startIcon={<AddIcon />}
            onClick={open}
            color="success"
            variant="contained"
          >
            Sportchi qo'shish
          </Button>
        </Stack>
        <Box flex={1} ref={ref}>
          <DataGrid
            rows={rows}
            columns={columns}
            disableRowSelectionOnClick
            slotProps={{
              loadingOverlay: {
                variant: "skeleton",
                noRowsVariant: "skeleton",
              },
            }}
            sx={{
              width,
              border: "none",
              "& .MuiDataGrid-cell": {
                borderBottom: "1px solid rgba(255,255,255,0.1)",
              },
            }}
            pageSizeOptions={[5, 10, 25]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
          />
        </Box>
      </Stack>
    </PageContainer>
  );
};

export default ListAthletePage;
