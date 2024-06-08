const API_URL = "https://wedev-api.sky.pro/api/v2/leaderboard";

export async function getLeaders() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Невозможно получить список лидеров");
      } else {
        throw new Error(`Ошибка! Статус: ${response.status}`);
      }
    }
    const data = await response.json();
    return data.leaders;
  } catch (error) {
    console.warn(error);
    throw error;
  }
}

export async function addLeaders({ name, time, achievements }) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        name,
        time,
        achievements,
      }),
    });
    if (!response.ok) {
      if (response.status === 400) {
        throw new Error("Не удалось загрузить список лидеров, попробуйте снова");
      } else {
        throw new Error(`Ошибка! Статус: ${response.status}`);
      }
    }
    return response.json();
  } catch (error) {
    alert("Ошибка сети, попробуйте снова");
    console.warn(error);
    throw error;
  }
}

// const API_URL = "https://wedev-api.sky.pro/api/v2/leaderboard";

// export async function getLeaders() {
//   const response = await fetch(API_URL, {
//     method: "GET",
//   });
//   if (response.status !== 200) {
//     throw new Error("Невозможно получить список лидеров");
//   } else {
//     const data = await response.json();
//     // console.log(data);
//     return data;
//   }
// }

// export async function addLeaders({ name, time, achievements }) {
//   const response = await fetch(API_URL, {
//     method: "POST",
//     body: JSON.stringify({
//       name,
//       time,
//       achievements,
//     }),
//   });
//   if (response.status === 201) {
//     const data = await response.json();
//     return data;
//   } else {
//     throw new Error("Не удалось загрузить список лидеров, попробуйте снова");
//   }
// }
