import {
  Flex,
  Heading,
  Link,
  ListItem,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  UnorderedList,
} from "@chakra-ui/react";

import NextLink from "next/link";
import { menuItemStyleProps } from "../lib/menu-style";
import {GetServerSideProps, NextPage} from "next";
import { globalBaseWidth } from "../styles/theme";

interface IConfigurationError {
  from?: string;
  issues?: Record<string, string | string[]>;
}

export const ConfigurationError: NextPage = ({
  issues,
  from,
}: IConfigurationError) => {
  return (
    <Flex
      direction="column"
      h="xl"
      alignItems="center"
      justifyContent="center"
      gap={4}
      p={8}
      maxW={globalBaseWidth}
      m="0 auto"
      w="full"
    >
      <Heading fontSize={{ base: "xl", md: "3xl" }} textAlign="center">
        There is a problem with the stores setup
      </Heading>
      <NextLink href={from ? from : "/"} passHref>
        <Link {...menuItemStyleProps} fontSize={{ base: "md", md: "lg" }}>
          Refresh
        </Link>
      </NextLink>
      <Table variant="simple" size={{ base: "sm", md: "md" }}>
        <Thead>
          <Tr>
            <Th>Issue</Th>
            <Th>Details</Th>
          </Tr>
        </Thead>
        <Tbody>
          {issues &&
            Object.keys(issues).map((key) => {
              const issue = issues[key];
              return (
                <Tr key={key}>
                  <Td>{key}</Td>
                  <Td>
                    <UnorderedList>
                      {(Array.isArray(issue) ? issue : [issue]).map(
                        (messsage) => (
                          <ListItem key={messsage} wordBreak="break-all">
                            {decodeURIComponent(messsage)}
                          </ListItem>
                        )
                      )}
                    </UnorderedList>
                  </Td>
                </Tr>
              );
            })}
        </Tbody>
      </Table>
    </Flex>
  );
};

export default ConfigurationError;

export const getServerSideProps: GetServerSideProps = async ({query}) => {
  const {
    "missing-env-variable": missingEnvVariables,
    authentication,
    from,
  } = query;
  return {
    props: {
      issues: {
        ...(missingEnvVariables && { missingEnvVariables }),
        ...(authentication && { authentication }),
      },
      from: Array.isArray(from) ? from[0] : from,
    },
  };
}