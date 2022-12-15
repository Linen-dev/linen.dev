import Example from '../Example';
import { Nav } from '@linen/ui';
import { FiBarChart, FiHash, FiRss } from 'react-icons/fi';

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
        <Nav.Label>Channels</Nav.Label>
        <Nav.Item active>
          <FiHash /> general
        </Nav.Item>
        <Nav.Item highlighted>
          <FiHash /> ideas
        </Nav.Item>
      </Nav>
    </Example>
  );
}
