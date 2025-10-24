import { Crud, DataSource, DataSourceCache } from "@toolpad/core/Crud";
import { useDemoRouter } from "@toolpad/core/internal";
import { Athlete, AthleteLevel } from "../types/Athlete"; // Adjust path if needed
import {
  listAthletesAPI,
  createAthleteAPI,
  updateAthleteAPI,
  deleteAthleteAPI,
  listAthleteLevelsAPI,
} from "../api/athletes"; // Adjust path based on your file structure (e.g., where the provided API code is saved)
import { ImageUpload } from "../components/ImageUpload";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";

// Optional: If you have an API to fetch AthleteLevels, define it here.
// For now, assuming levels are fetched separately or hardcoded for demo.
// If levels are dynamic, add a getLevelsAPI and use in renderFormField.

const athletesDataSource: DataSource<Athlete> = {
  fields: [
    { field: "id", headerName: "ID", type: "number", editable: false },
    {
      field: "firstname",
      headerName: "First Name",
      type: "string",
      width: 150,
    },
    { field: "lastname", headerName: "Last Name", type: "string", width: 150 },
    {
      field: "patronymic",
      headerName: "Patronymic",
      type: "string",
      width: 150,
    },
    {
      field: "level",
      headerName: "Level",
      width: 150,
      valueGetter: (v: AthleteLevel) => v.name,
      renderFormField: ({ value, onChange, error }) => {
        const { isLoading, data } = useQuery({
          queryKey: ["athlete-levels"],
          queryFn: listAthleteLevelsAPI,
          staleTime: Infinity,
        });

        return (
          <FormControl fullWidth>
            <InputLabel id="athlete-level-select-label">Daraja</InputLabel>
            <Select
              labelId="athlete-level-select-label"
              id="athlete-level-select"
              value={value}
              disabled={isLoading}
              error={!!error}
              label="Age"
              onChange={onChange as any}
            >
              {data?.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.name}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{error ?? " "}</FormHelperText>
          </FormControl>
        );
      },
    },
    { field: "birth_year", headerName: "Birth Year", type: "number" }, // Could be 'date' if formatted properly
    {
      field: "picture",
      headerName: "Picture",
      renderCell: (cell) => (
        <Box height={50} component={"img"} src={cell.value}></Box>
      ),
      renderFormField: ({ value, onChange, error }) => (
        <ImageUpload
          value={value as File}
          onChange={onChange as any}
          error={error}
        />
      ),
    }, // Could add image preview if needed

    {
      field: "created_at",
      width: 150,
      headerName: "Created At",
      // type: "dateTime",
      editable: false,
    },
    {
      field: "updated_at",
      width: 150,
      headerName: "Updated At",
      // type: "dateTime",
      editable: false,
    },
  ],
  getMany: async ({ paginationModel }) => {
    const athletes = await listAthletesAPI();
    const { page = athletes.current_page, pageSize = athletes.page_size } =
      paginationModel || {};
    const start = page * pageSize;
    const paginatedAthletes = athletes.results.slice(start, start + pageSize);
    return {
      items: paginatedAthletes,
      itemCount: athletes.count, // For server-side pagination, fetch count from API if available
    };
  },
  getOne: async (id) => {
    // Note: Your API doesn't have a getOne, so we'll fetch all and find. In production, add a getOne API.
    const athletes = await listAthletesAPI();
    return athletes.results.find((athlete) => athlete.id === id) as Athlete;
  },
  createOne: async (data) => {
    const newAthlete = await createAthleteAPI(data);
    return newAthlete;
  },
  updateOne: async (id, data) => {
    const updatedAthlete = await updateAthleteAPI(id as number, data);
    return updatedAthlete;
  },
  deleteOne: async (id) => {
    await deleteAthleteAPI(id as number);
  },
  validate: (values) => {
    const issues = [];
    if (!values.firstname)
      issues.push({ message: "First name required", path: ["firstname"] });
    if (!values.lastname)
      issues.push({ message: "Last name required", path: ["lastname"] });

    if (!values.level)
      issues.push({ message: "Level required", path: ["level"] });
    if (!values.patronymic)
      issues.push({ message: "Patronymic required", path: ["patronymic"] });
    if (!values.birth_year)
      issues.push({ message: "Birth year required", path: ["birth_year"] });

    if (!values.picture)
      issues.push({ message: "Rasm kerak", path: ["picture"] });

    // Add more validations as needed, e.g., for picture URL format
    return { issues };
  },
};

// Optional cache for performance
const athletesCache = new DataSourceCache();

function AthleteCrudPage() {
  const router = useDemoRouter("/athletes");

  // Remove this const when copying and pasting into your project.

  const showAthleteId = matchPath("/athletes/:athleteId", router.pathname);
  const editAthleteId = matchPath("/athletes/:athleteId/edit", router.pathname);

  return (
    <Crud<Athlete>
      dataSource={athletesDataSource}
      dataSourceCache={athletesCache}
      rootPath="/athletes" // Adjust based on your routing, e.g., in Next.js App Router
      initialPageSize={10}
      defaultValues={{
        firstname: "",
        lastname: "",
        name: "",
        level: 1 as any, // Default level ID
        patronymic: "",
        birth_year: "",
        picture: "",
        sport_type: "",
      }}
      pageTitles={{
        list: "Sportchilar ro'yhati",
        create: "Sportchi yaratish",
        edit: `Sportchi ${editAthleteId} - Tahrirlash`,
        show: `Sportchi ${showAthleteId}`,
      }}
      slotProps={{
        list: {
          dataGrid: {
            initialState: { pinnedColumns: { right: ["actions"] } },
          },
        },
      }}
    />
  );
}

function matchPath(pattern: string, pathname: string): string | null {
  const regex = new RegExp(`^${pattern.replace(/:[^/]+/g, "([^/]+)")}$`);
  const match = pathname.match(regex);
  return match ? match[1] : null;
}

export default AthleteCrudPage;
