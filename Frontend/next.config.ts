import type { NextConfig } from "next";
import withFlowbiteReact from "flowbite-react/plugin/nextjs";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "amrcdn.amrod.co.za",
      "example.com",
      "his-group-it-a3.s3.eu-north-1.amazonaws.com",
      "s3.amazonaws.com",
      "tarsus.co.za",
      "accounts.parrotproducts.biz"
    ], // allow this hostname
  },
};

export default withFlowbiteReact(nextConfig);
