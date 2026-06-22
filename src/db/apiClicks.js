import {UAParser} from "ua-parser-js";
import supabase from "./supabase";

// export async function getClicks() {
//   let {data, error} = await supabase.from("clicks").select("*");

//   if (error) {
//     console.error(error);
//     throw new Error("Unable to load Stats");
//   }

//   return data;
// }

export async function getClicksForUrls(urlIds) {
  const {data, error} = await supabase
    .from("clicks")
    .select("*")
    .in("url_id", urlIds);

  if (error) {
    console.error("Error fetching clicks:", error);
    return null;
  }

  return data;
}

export async function getClicksForUrl(url_id) {
  const {data, error} = await supabase
    .from("clicks")
    .select("*")
    .eq("url_id", url_id);

  if (error) {
    console.error(error);
    throw new Error("Unable to load Stats");
  }

  return data;
}

const parser = new UAParser();
 

export const storeClicks = async ({id, originalUrl}) => {
  console.log("STORE CLICKS CALLED");
  console.log("ID:", id);

  if (!originalUrl) {
    console.error("No original URL provided for redirection.");
    return;
  }

  const target = originalUrl.startsWith("http") ? originalUrl : `https://${originalUrl}`;

  try {
    const res = parser.getResult();
    const device = res.type || "desktop"; // Default to desktop if type is not detected

    let city = "Unknown";
    let country = "Unknown";

    try {
      const response = await fetch("https://ipapi.co/json");
      if (response.ok) {
        const ipData = await response.json();
        city = ipData.city || "Unknown";
        country = ipData.country_name || "Unknown";
      }
    } catch (ipError) {
      console.error("Error fetching IP location details:", ipError);
    }

    // Record the click
    const {error} = await supabase.from("clicks").insert({
      url_id: id,
      city,
      country,
      device,
    });

    if (error) {
      console.error("Database insert error:", error);
    }
  } catch (error) {
    console.error("Error recording click:", error);
  } finally {
    console.log("Redirecting to:", target);
    window.location.href = target;
  }
};