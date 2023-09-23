import { withStoreStaticProps } from "../lib/store-wrapper-ssg";
import Blurb from "../components/shared/blurb";

const About = () => <Blurb title="About" />;

export default About;

export const getServerSideProps = withStoreStaticProps();
