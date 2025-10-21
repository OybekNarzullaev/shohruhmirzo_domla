"use client";

import { Box, Typography } from "@mui/material";
import { Crud, DataModel, DataSource } from "@toolpad/core/Crud";
import { useQuery } from "@tanstack/react-query";
import { PageContainer } from "@toolpad/core/PageContainer";
import { listAthletesAPI } from "../api/athletes";
import { Athlete, AthleteLevel } from "../types/Athelete"; // ✅ Fayl nomi to‘g‘ri

const Athletes = () => {
  // Ma'lumotlarni API'dan olish
  const { data, isLoading, isError } = useQuery({
    queryKey: ["list-athletes"],
    queryFn: listAthletesAPI,
  });

  // API javobida data.data bo‘lsa
  const athletesStore: Athlete[] = data?.data;

  if (isLoading) {
    return (
      <PageContainer>
        <Typography>Yuklanmoqda...</Typography>
      </PageContainer>
    );
  }

  if (isError) {
    return (
      <PageContainer>
        <Typography color="error">
          Ma’lumotlarni yuklashda xatolik yuz berdi
        </Typography>
      </PageContainer>
    );
  }

  const dataSource: DataSource<Athlete & DataModel> = {
    fields: [
      { field: "firstname", headerName: "Ism", type: "string" },
      { field: "lastname", headerName: "Familiya", type: "string" },
      { field: "patronymic", headerName: "Otasining ismi", type: "string" },
      { field: "birth_year", headerName: "Tug‘ilgan yil", type: "string" },
      { field: "sport_type", headerName: "Sport turi", type: "string" },
      {
        field: "level",
        headerName: "Darajasi",
        valueGetter: (v: AthleteLevel) => v.name,
      },
      {
        field: "picture",
        headerName: "Rasm (URL)",
        renderCell: (v) => {
          return <Box component={"img"} src={v.value} alt="salom" />;
        },
      },
      {
        field: "created_at",
        headerName: "Yaratilgan sana",
        valueGetter: (v) => new Date(v).toLocaleDateString(),
      },
      {
        field: "updated_at",
        headerName: "Yangilangan sana",
        valueGetter: (v) => new Date(v).toLocaleDateString(),
      },
    ],

    getMany: async ({ paginationModel, filterModel, sortModel }) => {
      let athletes = [...athletesStore];

      // Apply filters (demo only)
      if (filterModel?.items?.length) {
        filterModel.items.forEach(({ field, value, operator }) => {
          if (!field || value == null) {
            return;
          }

          athletes = athletes.filter((a: any) => {
            const noteValue = a[field];

            switch (operator) {
              case "contains":
                return String(noteValue)
                  .toLowerCase()
                  .includes(String(value).toLowerCase());
              case "equals":
                return noteValue === value;
              case "startsWith":
                return String(noteValue)
                  .toLowerCase()
                  .startsWith(String(value).toLowerCase());
              case "endsWith":
                return String(noteValue)
                  .toLowerCase()
                  .endsWith(String(value).toLowerCase());
              case ">":
                return (noteValue as number) > value;
              case "<":
                return (noteValue as number) < value;
              default:
                return true;
            }
          });
        });
      }

      // Apply sorting
      if (sortModel?.length) {
        athletes.sort((a: any, b: any) => {
          for (const { field, sort } of sortModel) {
            if ((a[field] as number) < (b[field] as number)) {
              return sort === "asc" ? -1 : 1;
            }
            if ((a[field] as number) > (b[field] as number)) {
              return sort === "asc" ? 1 : -1;
            }
          }
          return 0;
        });
      }

      // Apply pagination
      const start = paginationModel.page * paginationModel.pageSize;
      const end = start + paginationModel.pageSize;
      const paginatedAthletes = athletes.slice(start, end);

      return {
        items: paginatedAthletes,
        itemCount: athletes.length,
      };
    },
  };

  return (
    <Crud<Athlete & DataModel>
      rootPath="/athletes"
      dataSource={dataSource}
      dataSourceCache={null}
      initialPageSize={10}
      defaultValues={{
        firstname: "",
        lastname: "",
        patronymic: "",
        name: "",
        level: 1,
        birth_year: "",
        sport_type: "",
        picture: "",
      }}
      pageTitles={{
        list: "Sportchilar ro‘yxati",
        create: "Yangi sportchi qo‘shish",
        edit: "Sportchini tahrirlash",
        show: "Sportchi ma’lumotlari",
      }}
    />
  );
};

export default Athletes;
