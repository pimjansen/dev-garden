export default function Modal() {
  return <Modal {...props}>
        <Dialog>
          <Heading slot="title" className="text-xl mt-0">Subscribe to our newsletter</Heading>
          <p className="text-sm">Enter your information to subscribe to our newsletter and receive updates about new features and announcements.</p>
          <Form>
            <TextField autoFocus label="Name" placeholder="Enter your full name" />
            <TextField label="Email" placeholder="Enter your email" />
            <div className="flex gap-2 self-end">
              <Button slot="close" variant="secondary">Cancel</Button>
              <Button slot="close">Subscribe</Button>
            </div>
          </Form>
        </Dialog>
      </Modal>);
}
