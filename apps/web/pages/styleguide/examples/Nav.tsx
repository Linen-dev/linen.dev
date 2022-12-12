import Example from '../Example';
import { Nav } from '@linen/ui';
import { FiRss, FiBarChart } from 'react-icons/fi';

export default function NavExample() {
  return (
    <Example header="Nav">
      <Nav>
        <Nav.Item>
          <FiRss /> Feed
        </Nav.Item>
        <Nav.Item>
          <FiBarChart />
          Metrics
        </Nav.Item>
      </Nav>
    </Example>
  );
}
