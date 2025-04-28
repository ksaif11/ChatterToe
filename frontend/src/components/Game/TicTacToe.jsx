const TicTacToe = ({ board, onMove }) => {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 100px)', gap: '5px' }}>
        {board.map((cell, index) => (
          <div
            key={index}
            style={{
              width: '100px',
              height: '100px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid black',
              fontSize: '24px',
              cursor: cell ? 'not-allowed' : 'pointer',
            }}
            onClick={() => onMove(index)}
          >
            {cell}
          </div>
        ))}
      </div>
    );
  };
  
  export default TicTacToe;