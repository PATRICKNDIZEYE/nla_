import React from "react";
import { Flex, Spin } from "antd";

const Spinner: React.FC = () => (
  <Flex
    align="center"
    gap="middle"
    className="min-h-screen flex-col items-center justify-center"
  >
    <Spin size="large" />
  </Flex>
);

export default Spinner;
