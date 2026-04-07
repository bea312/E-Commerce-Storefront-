import { Link } from 'react-router-dom';
import { EmptyState } from '../components/common/Feedback';

export const NotFoundPage = () => (
  <EmptyState
    title="Page not found"
    description="The route you requested does not exist in Aurora Market."
    action={<Link className="button" to="/">Back to storefront</Link>}
  />
);

export default NotFoundPage;
